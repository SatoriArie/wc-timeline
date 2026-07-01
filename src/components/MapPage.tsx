import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapPin, MapPinCategory, Zone } from '../data/types';
import { PIN_CATEGORIES, pinCategoryMeta } from '../data';
import { assetUrl } from '../utils/asset';

interface Props {
  zones: Zone[];
  pins: MapPin[];
  editMode: boolean;
  onZone: (z: Zone) => void;
  onPlaceZone: (id: string, x: number, y: number) => void;
  onSavePoly: (id: string, poly: [number, number][]) => void;
  onSavePin: (pin: MapPin) => void;
  onDeletePin: (id: string) => void;
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

// Иконки создаём ОДИН раз (стабильные ссылки) — иначе react-leaflet вызывает
// setIcon на каждый рендер и ломает перетаскивание маркера. Подсветка — через CSS :hover.
const ZONE_ICON = L.divIcon({
  className: 'map-pin-wrap',
  html: '<span class="map-zone-pin"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
const CAT_ICONS: Record<string, L.DivIcon> = Object.fromEntries(
  PIN_CATEGORIES.map((c) => [
    c.id,
    L.divIcon({
      className: 'map-pin-wrap',
      html: `<span class="map-cat-pin" style="--pc:${c.color}">${c.glyph}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    }),
  ]),
);

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    // cover-фит: карта заполняет канвас целиком (без пустых полос).
    // Перефитим, пока лэйаут дособирается (ленивая загрузка/полноширинный канвас),
    // и прекращаем, как только пользователь сам тронул карту.
    let userMoved = false;
    let programmatic = false;
    // наш собственный setView не должен считаться «пользователь тронул карту»
    const onUser = () => {
      if (!programmatic) userMoved = true;
    };
    const SNAP = 0.25; // = zoomSnap
    const fit = () => {
      if (userMoved) return;
      const s = map.getSize();
      if (!s.x || !s.y) return;
      // округляем ВВЕРХ до сетки snap, иначе zoomSnap округлит вниз и карта не покроет канвас
      const zCover = Math.ceil(Math.log2(Math.max(s.x / W, s.y / H)) / SNAP) * SNAP;
      const zContain = Math.floor(Math.log2(Math.min(s.x / W, s.y / H)) / SNAP) * SNAP;
      programmatic = true;
      map.setMinZoom(zContain - SNAP);
      map.setView([H / 2, W / 2], zCover, { animate: false });
      programmatic = false;
    };
    const boot = () => {
      map.invalidateSize();
      fit();
    };
    map.whenReady(boot);
    map.on('resize', fit);
    map.on('zoomstart', onUser);
    map.on('dragstart', onUser);
    const t1 = setTimeout(boot, 200);
    const t2 = setTimeout(boot, 600);
    return () => {
      map.off('resize', fit);
      map.off('zoomstart', onUser);
      map.off('dragstart', onUser);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}
function FlyTo({ target }: { target: { x: number; y: number; k: number } | null }) {
  const map = useMap();
  useEffect(() => {
    // фокус на зоне: умеренный зум (а не максимальный), если ещё не приближено
    if (target) map.flyTo(at(target.x, target.y), Math.max(map.getZoom(), -1), { duration: 0.6 });
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

export default function MapPage({
  zones,
  pins,
  editMode,
  onZone,
  onPlaceZone,
  onSavePoly,
  onSavePin,
  onDeletePin,
}: Props) {
  const [query, setQuery] = useState('');
  const [hoverZonePoly, setHoverZonePoly] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ x: number; y: number; k: number } | null>(null);
  // обводка зоны
  const [drawId, setDrawId] = useState<string | null>(null);
  const [drawPts, setDrawPts] = useState<[number, number][]>([]);
  // редактирование точки
  const [editPin, setEditPin] = useState<MapPin | null>(null);
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

  // все точки: зоны (category 'zone', координата из зоны) + редактируемые пины (датасет)
  const allPins = useMemo(() => {
    const out: { pin: MapPin; x: number; y: number; isZone: boolean; zoneId?: string }[] = [];
    for (const z of zones) {
      const c = zoneCoord.get(z.name);
      if (!c) continue;
      out.push({
        pin: { id: `zone-${z.id}`, title: z.name, category: 'zone', zone: z.name, score: 50 },
        x: c.x,
        y: c.y,
        isZone: true,
        zoneId: z.id,
      });
    }
    for (const p of pins) {
      out.push({ pin: p, x: p.x ?? 0, y: p.y ?? 0, isZone: false });
    }
    return out;
  }, [zones, zoneCoord, pins]);

  // максимум для слайдера — по контент-пинам (зоны со score=50 не учитываем)
  const maxScore = useMemo(
    () => allPins.reduce((m, p) => (p.isZone ? m : Math.max(m, p.pin.score)), 1),
    [allPins],
  );

  // видимые точки после фильтров; зоны фильтруем только по категории, не по популярности
  const visiblePins = useMemo(
    () =>
      allPins.filter(
        (p) => enabled.has(p.pin.category) && (p.isZone || p.pin.score >= minScore),
      ),
    [allPins, enabled, minScore],
  );

  // счётчик контент-точек по зонам (сам пин зоны не считаем)
  const pinsPerZone = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of allPins) if (!p.isZone) m[p.pin.zone] = (m[p.pin.zone] ?? 0) + 1;
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

  const addPin = () => {
    const p: MapPin = {
      id: `pin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Новая точка',
      category: 'lore',
      zone: '',
      score: 50,
      x: Math.round(W / 2),
      y: Math.round(H / 2),
    };
    onSavePin(p);
    setEditPin(p);
    setFlyTarget({ x: p.x as number, y: p.y as number, k: Date.now() });
  };

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
              zoomDelta={0.5}
              wheelPxPerZoomLevel={100}
              zoomControl={false}
              attributionControl={false}
              maxBounds={[
                [-2000, -2000],
                [H + 2000, W + 2000],
              ]}
              maxBoundsViscosity={0.7}
              className="leaflet-azeroth"
            >
              <ZoomControl position="topright" />
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

              {/* точки (прячем во время обводки) */}
              {!drawId &&
                visiblePins.map(({ pin, x, y, isZone, zoneId }) => {
                return (
                  <Marker
                    key={pin.id}
                    position={at(x, y)}
                    icon={isZone ? ZONE_ICON : CAT_ICONS[pin.category] ?? ZONE_ICON}
                    draggable={editMode}
                    eventHandlers={{
                      click: () => {
                        if (editMode && !isZone) setEditPin(pin);
                        else openPinZone(pin.zone);
                      },
                      dragend: (e) => {
                        const ll = (e.target as L.Marker).getLatLng();
                        const nx = Math.round(ll.lng);
                        const ny = Math.round(H - ll.lat);
                        if (isZone) onPlaceZone(zoneId as string, nx, ny);
                        else onSavePin({ ...pin, x: nx, y: ny });
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

            {editMode && !drawId && (
              <button className="map-add-pin" onClick={addPin} title="Добавить точку">
                + точка
              </button>
            )}

            {editPin && (
              <div className="pin-editor-overlay" onClick={() => setEditPin(null)}>
                <div className="pin-editor" onClick={(e) => e.stopPropagation()}>
                  <h3>Точка на карте</h3>
                  <label className="form-row">
                    <span>Название</span>
                    <input
                      value={editPin.title}
                      onChange={(e) => setEditPin({ ...editPin, title: e.target.value })}
                    />
                  </label>
                  <label className="form-row">
                    <span>Категория</span>
                    <select
                      className="form-select"
                      value={editPin.category}
                      onChange={(e) =>
                        setEditPin({ ...editPin, category: e.target.value as MapPinCategory })
                      }
                    >
                      {PIN_CATEGORIES.filter((c) => c.id !== 'zone').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.glyph} {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-row">
                    <span>Зона (откроется по клику)</span>
                    <select
                      className="form-select"
                      value={editPin.zone}
                      onChange={(e) => setEditPin({ ...editPin, zone: e.target.value })}
                    >
                      <option value="">—</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.name}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="pin-editor-actions">
                    <button
                      className="form-btn form-btn-save"
                      onClick={() => {
                        onSavePin(editPin);
                        setEditPin(null);
                      }}
                    >
                      ✓ Сохранить
                    </button>
                    <button className="form-btn form-btn-cancel" onClick={() => setEditPin(null)}>
                      Закрыть
                    </button>
                    <button
                      className="form-btn form-btn-delete"
                      onClick={() => {
                        onDeletePin(editPin.id);
                        setEditPin(null);
                      }}
                    >
                      🗑 Удалить
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="map-attribution">Карта © Blizzard Entertainment</div>
          </div>

          <div className="map-hint">
            {drawId
              ? 'Кликай по краю зоны — ставь точки контура. Точку тащи — двигать, клик по точке — удалить. Затем «Готово».'
              : editMode
                ? 'Edit: тащи любой пин чтобы двигать, клик по точке-категории — правка, «+ точка» — добавить, «Обвести» у зоны — контур.'
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
                  role="button"
                  tabIndex={0}
                  style={
                    thumb
                      ? {
                          backgroundImage: `linear-gradient(90deg, rgba(20,14,8,.82), rgba(20,14,8,.45)), url(${assetUrl(thumb)})`,
                        }
                      : undefined
                  }
                  onClick={() => {
                    if (c) setFlyTarget({ x: c.x, y: c.y, k: Date.now() });
                    onZone(z);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (c) setFlyTarget({ x: c.x, y: c.y, k: Date.now() });
                      onZone(z);
                    }
                  }}
                >
                  <span className="map-zone-card-name">{z.name}</span>
                  <span className="map-zone-card-region">
                    {z.region}
                    {cnt > 0 && <span className="map-zone-card-pins"> · {pts(cnt)}</span>}
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
