import { useEffect, useMemo, useRef, useState } from 'react';
import type { Character, PageId, TimelineEvent, Zone } from './data/types';
import { downloadJson, readJsonFile, useContent } from './hooks/useContent';
import { computeCrossRefs } from './utils/crossref';
import Background from './components/Background';
import EventsPage from './components/EventsPage';
import CharactersPage from './components/CharactersPage';
import ZonesPage from './components/ZonesPage';
import EventModal from './components/EventModal';
import CharacterModal from './components/CharacterModal';
import ZoneModal from './components/ZoneModal';
import EditModal from './components/EditModal';
import CosmologyPage from './components/CosmologyPage';
import PantheonsPage from './components/PantheonsPage';
import HomePage from './components/HomePage';
import MapPage from './components/MapPage';

type Entity = TimelineEvent | Character | Zone;
type Tab = PageId | 'home' | 'cosmology' | 'pantheons' | 'map';

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Главная' },
  { id: 'events', label: 'События' },
  { id: 'characters', label: 'Персонажи' },
  { id: 'zones', label: 'Зоны' },
  { id: 'map', label: 'Карта' },
  { id: 'cosmology', label: 'Космология' },
  { id: 'pantheons', label: 'Пантеоны' },
];

const TAB_IDS: Tab[] = ['home', 'events', 'characters', 'zones', 'map', 'cosmology', 'pantheons'];

/** Разбор URL-хэша вида #/event/<id>, #/character/<id>, #/zone/<id>, #/<tab>. */
function parseHash(): { kind: string; id?: string } {
  const seg = window.location.hash.replace(/^#\/?/, '').split('/');
  return { kind: seg[0] || 'home', id: seg[1] ? decodeURIComponent(seg[1]) : undefined };
}

function hashToTab(kind: string): Tab {
  if ((TAB_IDS as string[]).includes(kind)) return kind as Tab;
  if (kind === 'event') return 'events';
  if (kind === 'character') return 'characters';
  if (kind === 'zone') return 'zones';
  return 'events';
}

export default function App() {
  const c = useContent();
  const [page, setPage] = useState<Tab>(() => hashToTab(parseHash().kind));
  const [pendingRegion, setPendingRegion] = useState<string | undefined>(undefined);
  const isData = page === 'events' || page === 'characters' || page === 'zones';
  const [editMode, setEditMode] = useState(false);

  // просмотр
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);

  // редактирование
  const [editing, setEditing] = useState<{ open: boolean; item: Entity | null }>({
    open: false,
    item: null,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const openForView = {
    events: (e: TimelineEvent) =>
      editMode ? setEditing({ open: true, item: e }) : setActiveEvent(e),
    characters: (ch: Character) =>
      editMode ? setEditing({ open: true, item: ch }) : setActiveCharacter(ch),
    zones: (z: Zone) => (editMode ? setEditing({ open: true, item: z }) : setActiveZone(z)),
  };

  const saveEntity = (item: Entity) => {
    if (page === 'events') {
      const e = item as TimelineEvent;
      c.setEvents((prev) => upsert(prev, e).sort((a, b) => a.sortYear - b.sortYear));
    } else if (page === 'characters') {
      c.setCharacters((prev) => upsert(prev, item as Character));
    } else {
      c.setZones((prev) => upsert(prev, item as Zone));
    }
  };

  const deleteEntity = (id: string) => {
    if (page === 'events') c.setEvents((p) => p.filter((x) => x.id !== id));
    else if (page === 'characters') c.setCharacters((p) => p.filter((x) => x.id !== id));
    else c.setZones((p) => p.filter((x) => x.id !== id));
  };

  const exportCurrent = () => {
    if (page === 'events') downloadJson('events.json', c.events);
    else if (page === 'characters') downloadJson('characters.json', c.characters);
    else downloadJson('zones.json', c.zones);
  };

  const importCurrent = async (file: File) => {
    try {
      const data = await readJsonFile<Entity[]>(file);
      if (page === 'events') c.setEvents(data as TimelineEvent[]);
      else if (page === 'characters') c.setCharacters(data as Character[]);
      else c.setZones(data as Zone[]);
    } catch {
      alert('Не удалось прочитать JSON-файл.');
    }
  };

  const dataFile =
    page === 'events' ? 'events.json' : page === 'characters' ? 'characters.json' : 'zones.json';

  // переплетение лора: персонаж ↔ событие
  const crossRefs = useMemo(() => computeCrossRefs(c.events, c.characters), [c.events, c.characters]);
  const eventsById = useMemo(() => Object.fromEntries(c.events.map((e) => [e.id, e])), [c.events]);
  const charsById = useMemo(
    () => Object.fromEntries(c.characters.map((ch) => [ch.id, ch])),
    [c.characters],
  );

  const relatedCharacters = activeEvent
    ? (crossRefs.charactersByEvent[activeEvent.id] ?? []).map((id) => charsById[id]).filter(Boolean)
    : [];
  const relatedEvents = activeCharacter
    ? (crossRefs.eventsByCharacter[activeCharacter.id] ?? []).map((id) => eventsById[id]).filter(Boolean)
    : [];
  const characterRelations = activeCharacter
    ? activeCharacter.relations
        .map((r) => ({ character: charsById[r.id], kind: r.kind, note: r.note }))
        .filter((r) => r.character)
    : [];

  const openEventFromRef = (e: TimelineEvent) => {
    setActiveCharacter(null);
    setTimeout(() => setActiveEvent(e), 250);
  };
  const openCharacterById = (id: string) => {
    const ch = charsById[id];
    if (!ch) return;
    setActiveCharacter(null);
    setTimeout(() => setActiveCharacter(ch), 250);
  };

  // ===== Дип-линки: синхронизация URL-хэша с открытым контентом =====
  const lookup = useRef({ eventsById, charsById, zones: c.zones });
  lookup.current = { eventsById, charsById, zones: c.zones };
  const bootHash = useRef(parseHash()); // снимок хэша на первом рендере
  const linkReady = useRef(false);

  const applyHash = (parsed: { kind: string; id?: string }) => {
    const { kind, id } = parsed;
    setActiveEvent(null);
    setActiveCharacter(null);
    setActiveZone(null);
    if (kind === 'event' && id && lookup.current.eventsById[id]) {
      setPage('events');
      setActiveEvent(lookup.current.eventsById[id]);
    } else if (kind === 'character' && id && lookup.current.charsById[id]) {
      setPage('characters');
      setActiveCharacter(lookup.current.charsById[id]);
    } else if (kind === 'zone' && id) {
      const z = lookup.current.zones.find((x) => x.id === id);
      if (z) {
        setPage('zones');
        setActiveZone(z);
      }
    } else {
      setPage(hashToTab(kind));
    }
  };

  // слушатель навигации назад/вперёд
  useEffect(() => {
    const onHash = () => applyHash(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // применить дип-линк один раз, когда данные загружены (нужны для поиска сущности по id)
  useEffect(() => {
    if (c.status === 'ready' && !linkReady.current) {
      applyHash(bootHash.current);
      linkReady.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.status]);

  // отражать текущее состояние в URL (без замусоривания истории)
  useEffect(() => {
    if (!linkReady.current) return;
    let hash = `#/${page}`;
    if (activeEvent) hash = `#/event/${encodeURIComponent(activeEvent.id)}`;
    else if (activeCharacter) hash = `#/character/${encodeURIComponent(activeCharacter.id)}`;
    else if (activeZone) hash = `#/zone/${encodeURIComponent(activeZone.id)}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }, [page, activeEvent, activeCharacter, activeZone]);

  return (
    <>
      <Background />

      <header className="main-header">
        <h1 className="site-title">
          <span className="rune-symbol">✦</span>
          Хроники Азерота
          <span className="rune-symbol">✦</span>
        </h1>
        <p className="site-subtitle">Временная линия мира Warcraft</p>
        <div className="hero-stats">
          <span>
            <b>{c.events.length}</b> событий
          </span>
          <span className="hero-stats-sep">✦</span>
          <span>
            <b>{c.characters.length}</b> персонажей
          </span>
          <span className="hero-stats-sep">✦</span>
          <span>
            <b>{c.zones.length}</b> зон
          </span>
        </div>
      </header>

      <nav className="top-navigation">
        <div className="nav-container">
          <div className="nav-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`nav-tab ${page === t.id ? 'active' : ''}`}
                onClick={() => {
                  setPendingRegion(undefined);
                  setPage(t.id);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="nav-right">
            {isData && (
              <button
                className={`icon-btn ${editMode ? 'active' : ''}`}
                onClick={() => setEditMode((v) => !v)}
              >
                ✎ {editMode ? 'Готово' : 'Редактировать'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="page-container">
        {editMode && isData && (
          <div className="edit-banner">
            <span>Режим редактирования.</span>
            <span style={{ color: 'var(--parchment)', fontFamily: 'var(--font-body)' }}>
              Клик по карточке — правка. Изменения хранятся локально; для публикации жми «Экспорт» и
              положи <code>{dataFile}</code> в <code>public/data/</code>.
            </span>
            <button className="icon-btn" onClick={exportCurrent}>
              ⬇ Экспорт {dataFile}
            </button>
            <button className="icon-btn" onClick={() => fileRef.current?.click()}>
              ⬆ Импорт
            </button>
            {c.hasDraft && (
              <button className="icon-btn" onClick={c.resetToRepo}>
                ↺ Сбросить черновик
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && importCurrent(e.target.files[0])}
            />
          </div>
        )}

        {c.status === 'loading' && (
          <div className="loader">
            <span className="loader-rune">✦</span>
            <p>Раскрываем хроники Азерота…</p>
          </div>
        )}
        {c.status === 'error' && (
          <div className="empty-state">
            <p>Не удалось загрузить летопись.</p>
            <code style={{ color: 'var(--horde)' }}>{c.error}</code>
            <p>
              <button className="icon-btn active" onClick={() => location.reload()}>
                Попробовать снова
              </button>
            </p>
          </div>
        )}

        {c.status === 'ready' && page === 'home' && (
          <HomePage
            events={c.events}
            characters={c.characters}
            zones={c.zones}
            onNavigate={setPage}
            onOpenEvent={(e) => setActiveEvent(e)}
          />
        )}
        {c.status === 'ready' && page === 'events' && (
          <EventsPage events={c.events} onSelect={openForView.events} />
        )}
        {c.status === 'ready' && page === 'characters' && (
          <CharactersPage characters={c.characters} onSelect={openForView.characters} />
        )}
        {c.status === 'ready' && page === 'zones' && (
          <ZonesPage zones={c.zones} onSelect={openForView.zones} initialRegion={pendingRegion} />
        )}
        {c.status === 'ready' && page === 'map' && (
          <MapPage
            zones={c.zones}
            onSelectRegion={(r) => {
              setPendingRegion(r);
              setPage('zones');
            }}
          />
        )}
        {page === 'cosmology' && <CosmologyPage />}
        {page === 'pantheons' && <PantheonsPage />}
      </div>

      {editMode && isData && (
        <button className="add-fab" onClick={() => setEditing({ open: true, item: null })}>
          + Добавить
        </button>
      )}

      {/* Просмотр */}
      <EventModal
        event={activeEvent}
        characters={c.characters}
        relatedCharacters={relatedCharacters}
        onClose={() => setActiveEvent(null)}
        onCharacter={(id) => {
          setActiveEvent(null);
          const ch = charsById[id] ?? null;
          setTimeout(() => setActiveCharacter(ch), 250);
        }}
      />
      <CharacterModal
        character={activeCharacter}
        relatedEvents={relatedEvents}
        relations={characterRelations}
        onClose={() => setActiveCharacter(null)}
        onEvent={openEventFromRef}
        onCharacter={openCharacterById}
      />
      <ZoneModal zone={activeZone} onClose={() => setActiveZone(null)} />

      {/* Редактирование */}
      <EditModal
        type={isData ? (page as PageId) : 'events'}
        item={editing.item}
        open={editing.open}
        allCharacters={c.characters}
        onClose={() => setEditing({ open: false, item: null })}
        onSave={saveEntity}
        onDelete={deleteEntity}
      />
    </>
  );
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const copy = list.slice();
  copy[idx] = item;
  return copy;
}
