import { useEffect, useMemo, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Zone } from '../data/types';
import { assetUrl } from '../utils/asset';

interface Props {
  zones: Zone[];
  editMode: boolean;
  onZone: (z: Zone) => void;
  onPlaceZone: (id: string, x: number, y: number) => void;
}

// Система координат карты-подложки (px, верхний-левый угол) = размеры картинки.
const W = 10500;
const H = 8416;
const BOUNDS: L.LatLngBoundsExpression = [
  [0, 0],
  [H, W],
];
// px(сверху-слева) → latLng для L.CRS.Simple (ось Y инвертирована)
const at = (x: number, y: number): [number, number] => [H - y, x];

interface RegionDef {
  name: string;
  cx: number;
  cy: number;
}
// центры регионов — доли карты (Калимдор слева, Восточные королевства справа)
const REGIONS: RegionDef[] = [
  { name: 'Лордерон', cx: 0.8 * W, cy: 0.19 * H },
  { name: 'Каз Модан', cx: 0.83 * W, cy: 0.46 * H },
  { name: 'Азерот', cx: 0.84 * W, cy: 0.72 * H },
  { name: 'Северный Калимдор', cx: 0.23 * W, cy: 0.17 * H },
  { name: 'Центральный Калимдор', cx: 0.22 * W, cy: 0.47 * H },
  { name: 'Южный Калимдор', cx: 0.24 * W, cy: 0.78 * H },
];
const regionByName: Record<string, RegionDef> = Object.fromEntries(REGIONS.map((r) => [r.name, r]));
const EK = new Set(['Лордерон', 'Каз Модан', 'Азерот']);

// Точные позиции зон — доли карты [fx, fy] (по географии WoW на этой карте).
// Имя должно точно совпадать с названием зоны. Перетаскивание в edit перекрывает это.
const ZONE_COORDS: Record<string, [number, number]> = {
  // --- Восточные королевства: Лордерон (север) ---
  'Тирисфальские леса': [0.705, 0.205],
  'Серебряный бор': [0.69, 0.265],
  'Предгорья Хилсбрада': [0.715, 0.31],
  'Альтеракские горы': [0.745, 0.285],
  'Нагорье Арати': [0.78, 0.305],
  'Внутренние земли': [0.8, 0.265],
  'Западные Чумные земли': [0.75, 0.225],
  'Восточные Чумные земли': [0.79, 0.205],
  // --- Каз Модан (центр ВК) ---
  Болотина: [0.72, 0.4],
  'Тлеющие ушелье': [0.725, 0.46],
  'Бесплодные Земли': [0.775, 0.475],
  'Лох Модан': [0.755, 0.435],
  'Дун Морог': [0.7, 0.475],
  'Пылающие Степи': [0.74, 0.5],
  // --- Азерот (юг ВК) ---
  'Элвинский Лес': [0.715, 0.55],
  'Западный край': [0.68, 0.575],
  Красногорье: [0.755, 0.55],
  'Сумеречный Лес': [0.715, 0.6],
  'Перевал Мертвого Ветра': [0.75, 0.6],
  'Болота Печали': [0.785, 0.595],
  'Выжженные Степи': [0.795, 0.635],
  'Тернистая Долина': [0.71, 0.685],
  // --- Калимдор: север ---
  Тельдрассил: [0.1, 0.075],
  'Острова Лазурной Дымки (БК)': [0.04, 0.3],
  'Оскверненный Лес': [0.155, 0.17],
  'Лунная Поляна': [0.2, 0.155],
  'Зимние Ключи': [0.245, 0.16],
  'Темные Берега': [0.13, 0.2],
  'Гора Хиджал': [0.19, 0.235],
  'Ашенвальский Лес': [0.18, 0.255],
  Азшара: [0.27, 0.275],
  // --- Калимдор: центр ---
  Дуротар: [0.255, 0.37],
  'Когтистые Горы': [0.14, 0.42],
  Степи: [0.21, 0.43],
  Пустоши: [0.11, 0.485],
  Мулгор: [0.16, 0.5],
  'Пылевые Топи': [0.25, 0.52],
  // --- Калимдор: юг ---
  Фералас: [0.12, 0.605],
  'Кратер Унгоро': [0.19, 0.66],
  Силитус: [0.115, 0.705],
  Танарис: [0.22, 0.725],
  Ульдум: [0.17, 0.775],
  'Ан’Кираж': [0.09, 0.775],
};

const REGION_HALF_W = 720;
const REGION_HALF_H = 640;
function regionPoly(r: RegionDef): [number, number][] {
  const x0 = r.cx - REGION_HALF_W;
  const x1 = r.cx + REGION_HALF_W;
  const y0 = r.cy - REGION_HALF_H;
  const y1 = r.cy + REGION_HALF_H;
  return [at(x0, y0), at(x1, y0), at(x1, y1), at(x0, y1)];
}

// детерминированная авто-раскладка зон без координат — сетка внутри бокса региона
function autoPos(region: string, idx: number): { x: number; y: number } {
  const r = regionByName[region] ?? REGIONS[0];
  const cols = 4;
  const stepX = 300;
  const stepY = 300;
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  return { x: r.cx - stepX * 1.5 + col * stepX, y: r.cy - stepY + row * stepY };
}

function zonePin(active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<span class="map-zone-pin${active ? ' active' : ''}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

/** Вписать карту в границы при первом показе. */
function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(BOUNDS, { padding: [10, 10] });
  }, [map]);
  return null;
}

/** Плавно перелететь к выбранной точке. */
function FlyTo({ target }: { target: { x: number; y: number; k: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(at(target.x, target.y), Math.max(map.getZoom(), 0.5), { duration: 0.6 });
  }, [target, map]);
  return null;
}

export default function MapPage({ zones, editMode, onZone, onPlaceZone }: Props) {
  const [query, setQuery] = useState('');
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);
  const [hoverZone, setHoverZone] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ x: number; y: number; k: number } | null>(null);

  // координаты пинов: из данных или авто-раскладка
  const placed = useMemo(() => {
    const idxByRegion: Record<string, number> = {};
    return zones.map((z) => {
      let x = z.mapX;
      let y = z.mapY;
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        const coord = ZONE_COORDS[z.name];
        if (coord) {
          x = coord[0] * W;
          y = coord[1] * H;
        } else {
          const i = idxByRegion[z.region] ?? 0;
          idxByRegion[z.region] = i + 1;
          const p = autoPos(z.region, i);
          x = p.x;
          y = p.y;
        }
      }
      return { zone: z, x: x as number, y: y as number };
    });
  }, [zones]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return placed;
    return placed.filter(
      (p) => p.zone.name.toLowerCase().includes(q) || p.zone.region.toLowerCase().includes(q),
    );
  }, [placed, query]);

  const ekCount = zones.filter((z) => EK.has(z.region)).length;
  const kalimdorCount = zones.length - ekCount;

  return (
    <div className="mapview">
      <div className="map-layout">
        <div className="map-stage">
          <div className="map-canvas">
          <MapContainer
            crs={L.CRS.Simple}
            bounds={BOUNDS}
            minZoom={-5}
            maxZoom={1}
            zoomSnap={0.25}
            zoomControl={false}
            attributionControl={false}
            maxBounds={[
              [-2000, -2000],
              [H + 2000, W + 2000],
            ]}
            maxBoundsViscosity={0.7}
            className="leaflet-azeroth"
          >
            <FitBounds />
            <FlyTo target={flyTarget} />
            {/* как на classic+: фон → overlay(сетка/водоворот/виньетка) → карта; все зумятся с картой */}
            <ImageOverlay
              url={assetUrl('images/map/azeroth-bg.webp')}
              bounds={BOUNDS}
              interactive={false}
            />
            <ImageOverlay
              url={assetUrl('images/map/azeroth-overlay.webp')}
              bounds={BOUNDS}
              interactive={false}
            />
            <ImageOverlay
              url={assetUrl('images/map/azeroth-map.webp')}
              bounds={BOUNDS}
              interactive={false}
            />

            {/* зоны-хотспоты регионов — подсветка при наведении */}
            {REGIONS.map((r) => (
              <Polygon
                key={r.name}
                positions={regionPoly(r)}
                pathOptions={{
                  color: '#d8b46a',
                  weight: hoverRegion === r.name ? 2 : 1,
                  opacity: hoverRegion === r.name ? 0.6 : 0.18,
                  fillColor: '#d8b46a',
                  fillOpacity: hoverRegion === r.name ? 0.16 : 0.03,
                }}
                eventHandlers={{
                  mouseover: () => setHoverRegion(r.name),
                  mouseout: () => setHoverRegion(null),
                }}
              >
                <Tooltip direction="center" className="map-region-tip" sticky>
                  {r.name}
                </Tooltip>
              </Polygon>
            ))}

            {/* пины зон */}
            {placed.map((p) => (
              <Marker
                key={p.zone.id}
                position={at(p.x, p.y)}
                icon={zonePin(hoverZone === p.zone.id)}
                draggable={editMode}
                eventHandlers={{
                  click: () => onZone(p.zone),
                  mouseover: () => setHoverZone(p.zone.id),
                  mouseout: () => setHoverZone(null),
                  dragend: (e) => {
                    const ll = (e.target as L.Marker).getLatLng();
                    onPlaceZone(p.zone.id, Math.round(ll.lng), Math.round(H - ll.lat));
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -12]} className="map-zone-tip">
                  {p.zone.name}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
            <div className="map-attribution">Карта © Blizzard Entertainment</div>
          </div>

          <div className="map-hint">
            {editMode
              ? 'Режим редактирования: перетащи пин, чтобы разместить зону на карте.'
              : 'Колесо — зум, перетаскивание — двигать карту. Клик по пину — открыть зону.'}
          </div>
        </div>

        {/* боковая панель */}
        <aside className="map-aside">
          <h1 className="map-aside-title">Карта Азерота</h1>
          <div className="map-stats">
            <div className="map-stat">
              <b>{zones.length}</b>
              <span>зон</span>
            </div>
            <div className="map-stat">
              <b>{ekCount}</b>
              <span>В. Королевства</span>
            </div>
            <div className="map-stat">
              <b>{kalimdorCount}</b>
              <span>Калимдор</span>
            </div>
          </div>

          <input
            className="map-search"
            placeholder="Поиск зоны…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="map-zone-list">
            {filtered.length === 0 && <p className="modal-meta">Ничего не найдено.</p>}
            {filtered.map((p) => {
              const thumb = p.zone.images[0];
              return (
                <button
                  key={p.zone.id}
                  className="map-zone-card"
                  style={
                    thumb
                      ? { backgroundImage: `linear-gradient(90deg, rgba(20,14,8,.82), rgba(20,14,8,.45)), url(${assetUrl(thumb)})` }
                      : undefined
                  }
                  onMouseEnter={() => setHoverZone(p.zone.id)}
                  onMouseLeave={() => setHoverZone(null)}
                  onClick={() => {
                    setFlyTarget({ x: p.x, y: p.y, k: Date.now() });
                    onZone(p.zone);
                  }}
                >
                  <span className="map-zone-card-name">{p.zone.name}</span>
                  <span className="map-zone-card-region">{p.zone.region}</span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
