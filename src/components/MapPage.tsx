import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapPin, MapPinCategory, Zone } from '../data/types';
import { PIN_CATEGORIES, pinCategoryMeta, curatedPins } from '../data';
import { assetUrl } from '../utils/asset';

interface Props {
  zones: Zone[];
  editMode: boolean;
  onZone: (z: Zone) => void;
  onPlaceZone: (id: string, x: number, y: number) => void;
  onSavePoly: (id: string, poly: [number, number][]) => void;
}

// Система координат карты-подложки (px, верхний-левый угол) = размеры картинки.
const W = 10500;
const H = 8416;
const BOUNDS: L.LatLngBoundsExpression = [
  [0, 0],
  [H, W],
];
const at = (x: number, y: number): [number, number] => [H - y, x];

interface RegionDef {
  name: string;
  cx: number;
  cy: number;
}
const REGIONS: RegionDef[] = [
  { name: 'Лордерон', cx: 0.8 * W, cy: 0.19 * H },
  { name: 'Каз Модан', cx: 0.83 * W, cy: 0.46 * H },
  { name: 'Азерот', cx: 0.84 * W, cy: 0.72 * H },
  { name: 'Северный Калимдор', cx: 0.23 * W, cy: 0.17 * H },
  { name: 'Центральный Калимдор', cx: 0.22 * W, cy: 0.47 * H },
  { name: 'Южный Калимдор', cx: 0.24 * W, cy: 0.78 * H },
];
const regionByName: Record<string, RegionDef> = Object.fromEntries(REGIONS.map((r) => [r.name, r]));

function autoPos(region: string, idx: number): { x: number; y: number } {
  const r = regionByName[region] ?? REGIONS[0];
  const cols = 4;
  const stepX = 300;
  const stepY = 300;
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  return { x: r.cx - stepX * 1.5 + col * stepX, y: r.cy - stepY + row * stepY };
}

function zonePinIcon(active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<span class="map-zone-pin${active ? ' active' : ''}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
function catPinIcon(cat: MapPinCategory, active: boolean): L.DivIcon {
  const m = pinCategoryMeta(cat);
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<span class="map-cat-pin${active ? ' active' : ''}" style="--pc:${m.color}">${m.glyph}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(BOUNDS, { padding: [10, 10] });
  }, [map]);
  return null;
}
function FlyTo({ target }: { target: { x: number; y: number; k: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(at(target.x, target.y), Math.max(map.getZoom(), 0.5), { duration: 0.6 });
  }, [target, map]);
  return null;
}

/** Клик по карте в режиме обводки → добавить вершину. */
function ClickToAdd({ active, onAdd }: { active: boolean; onAdd: (x: number, y: number) => void }) {
  useMapEvents({
    click(e) {
      if (active) onAdd(Math.round(e.latlng.lng), Math.round(H - e.latlng.lat));
    },
  });
  return null;
}

const vertexIcon = L.divIcon({
  className: 'map-vertex-wrap',
  html: '<span class="map-vertex"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

type SortMode = 'trending' | 'name' | 'pins';

/** Русское склонение слова «точка». */
function pts(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} точка`;
  if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return `${n} точки`;
  return `${n} точек`;
}

export default function MapPage({ zones, editMode, onZone, onPlaceZone, onSavePoly }: Props) {
  const [query, setQuery] = useState('');
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);
  const [hoverPin, setHoverPin] = useState<string | null>(null);
  const [hoverZonePoly, setHoverZonePoly] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ x: number; y: number; k: number } | null>(null);
  // обводка зоны
  const [drawId, setDrawId] = useState<string | null>(null);
  const [drawPts, setDrawPts] = useState<[number, number][]>([]);
  const [enabled, setEnabled] = useState<Set<MapPinCategory>>(
    () => new Set(PIN_CATEGORIES.map((c) => c.id)),
  );
  const [minScore, setMinScore] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sort, setSort] = useState<SortMode>('trending');

  const zoneByName = useMemo(() => {
    const m = new Map<string, Zone>();
    for (const z of zones) m.set(z.name, z);
    return m;
  }, [zones]);

  // координаты зон (из данных или авто-раскладка)
  const zoneCoord = useMemo(() => {
    const idxByRegion: Record<string, number> = {};
    const m = new Map<string, { x: number; y: number }>();
    for (const z of zones) {
      let x = z.mapX;
      let y = z.mapY;
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        const i = idxByRegion[z.region] ?? 0;
        idxByRegion[z.region] = i + 1;
        const p = autoPos(z.region, i);
        x = p.x;
        y = p.y;
      }
      m.set(z.name, { x: x as number, y: y as number });
    }
    return m;
  }, [zones]);

  // все точки: зоны (category 'zone') + кураторские пины, привязанные к зонам
  const allPins = useMemo(() => {
    const out: { pin: MapPin; x: number; y: number }[] = [];
    for (const z of zones) {
      const c = zoneCoord.get(z.name);
      if (!c) continue;
      out.push({
        pin: { id: `zone-${z.id}`, title: z.name, category: 'zone', zone: z.name, score: 50 },
        x: c.x,
        y: c.y,
      });
    }
    // смещения для нескольких пинов в одной зоне
    const perZone: Record<string, number> = {};
    for (const p of curatedPins) {
      let x = p.x;
      let y = p.y;
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        const c = zoneCoord.get(p.zone);
        if (!c) continue; // зоны нет в данных — пропускаем
        const i = perZone[p.zone] ?? 0;
        perZone[p.zone] = i + 1;
        const ang = (i * 2.4) % (Math.PI * 2);
        x = c.x + Math.cos(ang) * (140 + i * 30);
        y = c.y + Math.sin(ang) * (140 + i * 30) + 120;
      }
      out.push({ pin: p, x: x as number, y: y as number });
    }
    return out;
  }, [zones, zoneCoord]);

  const maxScore = useMemo(() => Math.max(1, ...allPins.map((p) => p.pin.score)), [allPins]);

  // видимые точки после фильтров
  const visiblePins = useMemo(
    () => allPins.filter((p) => enabled.has(p.pin.category) && p.pin.score >= minScore),
    [allPins, enabled, minScore],
  );

  // счётчик точек по зонам
  const pinsPerZone = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of allPins) m[p.pin.zone] = (m[p.pin.zone] ?? 0) + 1;
    return m;
  }, [allPins]);

  // список зон в сайдбаре (поиск + сортировка)
  const zoneList = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = zones.filter(
      (z) => !q || z.name.toLowerCase().includes(q) || z.region.toLowerCase().includes(q),
    );
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'pins')
      list = [...list].sort((a, b) => (pinsPerZone[b.name] ?? 0) - (pinsPerZone[a.name] ?? 0));
    return list;
  }, [zones, query, sort, pinsPerZone]);

  const toggleCat = (id: MapPinCategory) =>
    setEnabled((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const selectAll = () => setEnabled(new Set(PIN_CATEGORIES.map((c) => c.id)));
  const resetFilters = () => {
    selectAll();
    setMinScore(0);
  };

  const openPinZone = (zoneName: string) => {
    const z = zoneByName.get(zoneName);
    if (z) onZone(z);
  };

  const startDraw = (z: Zone) => {
    setDrawId(z.id);
    setDrawPts((z.poly ?? []).map((p) => [p[0], p[1]]));
    const c = zoneCoord.get(z.name);
    if (c) setFlyTarget({ x: c.x, y: c.y, k: Date.now() });
  };
  const addPt = (x: number, y: number) => setDrawPts((p) => [...p, [x, y]]);
  const movePt = (i: number, x: number, y: number) =>
    setDrawPts((p) => p.map((pt, idx) => (idx === i ? [x, y] : pt)));
  const removePt = (i: number) => setDrawPts((p) => p.filter((_, idx) => idx !== i));
  const finishDraw = () => {
    if (drawId) onSavePoly(drawId, drawPts);
    setDrawId(null);
    setDrawPts([]);
  };
  const cancelDraw = () => {
    setDrawId(null);
    setDrawPts([]);
  };
  const drawingZone = drawId ? zones.find((z) => z.id === drawId) : null;

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
              <ImageOverlay url={assetUrl('images/map/azeroth-bg.webp')} bounds={BOUNDS} interactive={false} />
              <ImageOverlay url={assetUrl('images/map/azeroth-overlay.webp')} bounds={BOUNDS} interactive={false} />
              <ImageOverlay url={assetUrl('images/map/azeroth-map.webp')} bounds={BOUNDS} interactive={false} />
              <ClickToAdd active={!!drawId} onAdd={addPt} />

              {/* контуры зон (обводка) */}
              {zones.map((z) =>
                z.poly && z.poly.length >= 3 && z.id !== drawId ? (
                  <Polygon
                    key={`poly-${z.id}`}
                    positions={z.poly.map((p) => at(p[0], p[1]))}
                    interactive={!drawId}
                    pathOptions={{
                      color: '#ffcf57',
                      weight: hoverZonePoly === z.id ? 2.5 : 1.5,
                      opacity: drawId ? 0.25 : hoverZonePoly === z.id ? 0.9 : 0.45,
                      fillColor: '#ffcf57',
                      fillOpacity: hoverZonePoly === z.id ? 0.22 : 0.05,
                    }}
                    eventHandlers={{
                      click: () => onZone(z),
                      mouseover: () => setHoverZonePoly(z.id),
                      mouseout: () => setHoverZonePoly(null),
                    }}
                  >
                    <Tooltip direction="center" className="map-region-tip" sticky>
                      {z.name}
                    </Tooltip>
                  </Polygon>
                ) : null,
              )}

              {/* регионы-хотспоты (запаска, прячем во время обводки) */}
              {!drawId &&
                REGIONS.map((r) => {
                const half = 720;
                const halfH = 640;
                return (
                  <Polygon
                    key={r.name}
                    positions={[
                      at(r.cx - half, r.cy - halfH),
                      at(r.cx + half, r.cy - halfH),
                      at(r.cx + half, r.cy + halfH),
                      at(r.cx - half, r.cy + halfH),
                    ]}
                    pathOptions={{
                      color: '#d8b46a',
                      weight: hoverRegion === r.name ? 2 : 1,
                      opacity: hoverRegion === r.name ? 0.5 : 0.12,
                      fillColor: '#d8b46a',
                      fillOpacity: hoverRegion === r.name ? 0.1 : 0.02,
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
                );
              })}

              {/* точки (прячем во время обводки) */}
              {!drawId &&
                visiblePins.map(({ pin, x, y }) => {
                const isZone = pin.category === 'zone';
                const draggable = editMode && isZone;
                return (
                  <Marker
                    key={pin.id}
                    position={at(x, y)}
                    icon={
                      isZone
                        ? zonePinIcon(hoverPin === pin.id)
                        : catPinIcon(pin.category, hoverPin === pin.id)
                    }
                    draggable={draggable}
                    eventHandlers={{
                      click: () => openPinZone(pin.zone),
                      mouseover: () => setHoverPin(pin.id),
                      mouseout: () => setHoverPin(null),
                      dragend: (e) => {
                        if (!isZone) return;
                        const ll = (e.target as L.Marker).getLatLng();
                        const zid = pin.id.replace(/^zone-/, '');
                        onPlaceZone(zid, Math.round(ll.lng), Math.round(H - ll.lat));
                      },
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -12]} className="map-zone-tip">
                      {pin.title}
                      {!isZone && <span className="map-tip-cat"> · {pinCategoryMeta(pin.category).label}</span>}
                    </Tooltip>
                  </Marker>
                );
              })}

              {/* слой обводки */}
              {drawId && drawPts.length >= 3 && (
                <Polygon
                  positions={drawPts.map((p) => at(p[0], p[1]))}
                  interactive={false}
                  pathOptions={{ color: '#ffcf57', weight: 2, fillColor: '#ffcf57', fillOpacity: 0.18 }}
                />
              )}
              {drawId && drawPts.length === 2 && (
                <Polyline
                  positions={drawPts.map((p) => at(p[0], p[1]))}
                  interactive={false}
                  pathOptions={{ color: '#ffcf57', weight: 2 }}
                />
              )}
              {drawId &&
                drawPts.map((p, i) => (
                  <Marker
                    key={`v-${i}`}
                    position={at(p[0], p[1])}
                    icon={vertexIcon}
                    draggable
                    eventHandlers={{
                      click: () => removePt(i),
                      dragend: (e) => {
                        const ll = (e.target as L.Marker).getLatLng();
                        movePt(i, Math.round(ll.lng), Math.round(H - ll.lat));
                      },
                    }}
                  />
                ))}
            </MapContainer>

            {/* левая панель фильтров (прячем во время обводки) */}
            {!drawId && (
            <div className={`map-filters ${panelOpen ? 'open' : 'collapsed'}`}>
              <button
                className="map-filters-toggle"
                onClick={() => setPanelOpen((v) => !v)}
                title={panelOpen ? 'Свернуть' : 'Фильтры'}
              >
                {panelOpen ? '‹' : '›'}
              </button>
              {panelOpen && (
                <div className="map-filters-body">
                  <div className="map-filters-head">
                    <span>Категории</span>
                    <button className="map-mini-btn" onClick={selectAll}>
                      Все
                    </button>
                  </div>
                  <div className="map-cat-list">
                    {PIN_CATEGORIES.map((c) => (
                      <label key={c.id} className="map-cat-row">
                        <input
                          type="checkbox"
                          checked={enabled.has(c.id)}
                          onChange={() => toggleCat(c.id)}
                        />
                        <span className="map-cat-ico" style={{ background: c.color }}>
                          {c.glyph}
                        </span>
                        <span className="map-cat-label">{c.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="map-slider-row">
                    <span>Популярность ≥ {minScore}</span>
                    <input
                      type="range"
                      min={0}
                      max={maxScore}
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                    />
                  </div>
                  <button className="map-reset-btn" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
                  <div className="map-showing">Показано: {pts(visiblePins.length)}</div>
                </div>
              )}
            </div>
            )}

            {drawId && (
              <div className="map-draw-bar">
                <span className="map-draw-title">Обводка: {drawingZone?.name}</span>
                <span className="map-draw-count">{drawPts.length} точек</span>
                <button className="map-draw-btn done" onClick={finishDraw}>
                  ✓ Готово
                </button>
                <button className="map-draw-btn" onClick={() => setDrawPts([])}>
                  Очистить
                </button>
                <button className="map-draw-btn cancel" onClick={cancelDraw}>
                  Отмена
                </button>
              </div>
            )}

            <div className="map-attribution">Карта © Blizzard Entertainment</div>
          </div>

          <div className="map-hint">
            {drawId
              ? 'Кликай по краю зоны — ставь точки контура. Точку тащи — двигать, клик по точке — удалить. Затем «Готово».'
              : editMode
                ? 'Режим редактирования: перетащи пин зоны или нажми «Обвести» у зоны в списке.'
                : 'Колесо — зум, перетаскивание — двигать карту. Клик по точке — открыть зону.'}
          </div>
        </div>

        {/* боковая панель */}
        <aside className="map-aside">
          <h1 className="map-aside-title">Карта Азерота</h1>
          <div className="map-stats">
            <div className="map-stat">
              <b>{allPins.length}</b>
              <span>точек</span>
            </div>
            <div className="map-stat">
              <b>{visiblePins.length}</b>
              <span>показано</span>
            </div>
            <div className="map-stat">
              <b>{zones.length}</b>
              <span>зон</span>
            </div>
          </div>

          <div className="map-search-row">
            <input
              className="map-search"
              placeholder="Поиск зоны…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="map-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              title="Сортировка"
            >
              <option value="trending">По умолчанию</option>
              <option value="pins">По числу точек</option>
              <option value="name">По алфавиту</option>
            </select>
          </div>

          <div className="map-zone-list">
            {zoneList.length === 0 && <p className="modal-meta">Ничего не найдено.</p>}
            {zoneList.map((z) => {
              const thumb = z.images[0];
              const c = zoneCoord.get(z.name);
              const cnt = pinsPerZone[z.name] ?? 0;
              return (
                <div
                  key={z.id}
                  className="map-zone-card"
                  style={
                    thumb
                      ? {
                          backgroundImage: `linear-gradient(90deg, rgba(20,14,8,.82), rgba(20,14,8,.45)), url(${assetUrl(thumb)})`,
                        }
                      : undefined
                  }
                  onMouseEnter={() => setHoverPin(`zone-${z.id}`)}
                  onMouseLeave={() => setHoverPin(null)}
                  onClick={() => {
                    if (c) setFlyTarget({ x: c.x, y: c.y, k: Date.now() });
                    onZone(z);
                  }}
                >
                  <span className="map-zone-card-name">{z.name}</span>
                  <span className="map-zone-card-region">
                    {z.region}
                    {cnt > 1 && <span className="map-zone-card-pins"> · {pts(cnt)}</span>}
                    {z.poly && z.poly.length >= 3 && <span className="map-zone-card-poly"> · контур ✓</span>}
                  </span>
                  {editMode && (
                    <button
                      className="map-trace-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startDraw(z);
                      }}
                    >
                      {z.poly && z.poly.length >= 3 ? 'Править контур' : 'Обвести'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
