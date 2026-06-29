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

// Система координат карты-подложки (px, верхний-левый угол).
const W = 2000;
const H = 1400;
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
const REGIONS: RegionDef[] = [
  { name: 'Лордерон', cx: 1430, cy: 360 },
  { name: 'Каз Модан', cx: 1465, cy: 700 },
  { name: 'Азерот', cx: 1420, cy: 1015 },
  { name: 'Северный Калимдор', cx: 520, cy: 360 },
  { name: 'Центральный Калимдор', cx: 520, cy: 710 },
  { name: 'Южный Калимдор', cx: 545, cy: 1025 },
];
const regionByName: Record<string, RegionDef> = Object.fromEntries(REGIONS.map((r) => [r.name, r]));
const EK = new Set(['Лордерон', 'Каз Модан', 'Азерот']);

const REGION_HALF_W = 235;
const REGION_HALF_H = 175;
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
  const stepX = 112;
  const stepY = 92;
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  return { x: r.cx - 168 + col * stepX, y: r.cy - 120 + row * stepY };
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
        const i = idxByRegion[z.region] ?? 0;
        idxByRegion[z.region] = i + 1;
        const p = autoPos(z.region, i);
        x = p.x;
        y = p.y;
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
          <MapContainer
            crs={L.CRS.Simple}
            bounds={BOUNDS}
            minZoom={-2}
            maxZoom={2}
            zoomSnap={0.25}
            zoomControl={false}
            attributionControl={false}
            maxBounds={[
              [-300, -300],
              [H + 300, W + 300],
            ]}
            maxBoundsViscosity={0.7}
            className="leaflet-azeroth"
          >
            <FitBounds />
            <FlyTo target={flyTarget} />
            <ImageOverlay url={assetUrl('images/map/azeroth-placeholder.svg')} bounds={BOUNDS} />

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
