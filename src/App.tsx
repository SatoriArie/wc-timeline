import { useEffect, useMemo, useRef, useState } from 'react';
import type { Character, Organization, PageId, TimelineEvent, Zone } from './data/types';
import { downloadJson, readJsonFile, useContent } from './hooks/useContent';
import { useAuth } from './hooks/useAuth';
import { isCloud, fetchRepo, saveDataset, seedCloud, type DatasetId } from './data';
import { computeCrossRefs } from './utils/crossref';
import Background from './components/Background';
import EventsPage from './components/EventsPage';
import CharactersPage from './components/CharactersPage';
import ZonesPage from './components/ZonesPage';
import EventModal from './components/EventModal';
import CharacterModal from './components/CharacterModal';
import ZoneModal from './components/ZoneModal';
import OrganizationModal from './components/OrganizationModal';
import EditModal from './components/EditModal';
import CosmologyPage from './components/CosmologyPage';
import PantheonsPage from './components/PantheonsPage';
import OrganizationsPage from './components/OrganizationsPage';
import HomePage from './components/HomePage';
import MapPage from './components/MapPage';

type Entity = TimelineEvent | Character | Zone | Organization;
type Tab = PageId | 'home' | 'cosmology' | 'pantheons' | 'map';

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Главная' },
  { id: 'events', label: 'События' },
  { id: 'characters', label: 'Персонажи' },
  { id: 'zones', label: 'Зоны' },
  { id: 'map', label: 'Карта' },
  { id: 'cosmology', label: 'Космология' },
  { id: 'pantheons', label: 'Пантеоны' },
  { id: 'organizations', label: 'Фракции' },
];

const TAB_IDS: Tab[] = [
  'home',
  'events',
  'characters',
  'zones',
  'map',
  'cosmology',
  'pantheons',
  'organizations',
];

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
  if (kind === 'faction') return 'organizations';
  return 'events';
}

export default function App() {
  const c = useContent();
  const auth = useAuth();
  const [page, setPage] = useState<Tab>(() => hashToTab(parseHash().kind));
  const [pendingRegion, setPendingRegion] = useState<string | undefined>(undefined);
  const [factionTarget, setFactionTarget] = useState<string | undefined>(undefined);
  const isData =
    page === 'events' || page === 'characters' || page === 'zones' || page === 'organizations';
  const [editMode, setEditMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  const [syncToast, setSyncToast] = useState(false);

  // тост при realtime-обновлении от других редакторов
  useEffect(() => {
    if (c.syncCount === 0) return;
    setSyncToast(true);
    const t = setTimeout(() => setSyncToast(false), 2600);
    return () => clearTimeout(t);
  }, [c.syncCount]);

  // запись датасета в облако (только для вошедших редакторов)
  const pushCloud = (id: DatasetId, data: unknown[]) => {
    if (!isCloud) return;
    if (!auth.email) {
      setAuthMsg('Войдите как редактор, чтобы сохранить правки в облако.');
      return;
    }
    saveDataset(id, data)
      .then(() => setAuthMsg('Сохранено в облако ✓'))
      .catch((e) => setAuthMsg('Не удалось сохранить в облако: ' + e.message));
  };

  // просмотр
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);

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
    organizations: (o: Organization) =>
      editMode ? setEditing({ open: true, item: o }) : setActiveOrg(o),
  };

  const saveEntity = (item: Entity) => {
    if (page === 'events') {
      const next = upsert(c.events, item as TimelineEvent).sort((a, b) => a.sortYear - b.sortYear);
      c.setEvents(next);
      pushCloud('events', next);
    } else if (page === 'characters') {
      const next = upsert(c.characters, item as Character);
      c.setCharacters(next);
      pushCloud('characters', next);
    } else if (page === 'zones') {
      const next = upsert(c.zones, item as Zone);
      c.setZones(next);
      pushCloud('zones', next);
    } else {
      const next = upsert(c.organizations, item as Organization);
      c.setOrganizations(next);
      pushCloud('organizations', next);
    }
  };

  const saveZoneCoords = (id: string, x: number, y: number) => {
    const next = c.zones.map((z) => (z.id === id ? { ...z, mapX: x, mapY: y } : z));
    c.setZones(next);
    pushCloud('zones', next);
  };

  const deleteEntity = (id: string) => {
    if (page === 'events') {
      const next = c.events.filter((x) => x.id !== id);
      c.setEvents(next);
      pushCloud('events', next);
    } else if (page === 'characters') {
      const next = c.characters.filter((x) => x.id !== id);
      c.setCharacters(next);
      pushCloud('characters', next);
    } else if (page === 'zones') {
      const next = c.zones.filter((x) => x.id !== id);
      c.setZones(next);
      pushCloud('zones', next);
    } else {
      const next = c.organizations.filter((x) => x.id !== id);
      c.setOrganizations(next);
      pushCloud('organizations', next);
    }
  };

  const handleSeedCloud = async () => {
    try {
      await seedCloud({
        events: c.events,
        characters: c.characters,
        zones: c.zones,
        organizations: c.organizations,
      });
      setAuthMsg('Текущие данные залиты в облако ✓');
    } catch (e) {
      setAuthMsg('Ошибка заливки: ' + (e as Error).message);
    }
  };

  const handleSyncFromRepo = async () => {
    if (!confirm('Заменить облако данными из репозитория? Несохранённые облачные правки будут перезаписаны.')) return;
    try {
      const fresh = await fetchRepo();
      await seedCloud(fresh);
      c.setEvents(fresh.events);
      c.setCharacters(fresh.characters);
      c.setZones(fresh.zones);
      c.setOrganizations(fresh.organizations);
      setAuthMsg('Облако обновлено из репозитория ✓');
    } catch (e) {
      setAuthMsg('Ошибка синхронизации: ' + (e as Error).message);
    }
  };

  const handleSignIn = async () => {
    const r = await auth.signIn(authEmail, authPassword);
    setAuthMsg(r.message);
    if (r.ok) setAuthPassword('');
  };

  const exportCurrent = () => {
    if (page === 'events') downloadJson('events.json', c.events);
    else if (page === 'characters') downloadJson('characters.json', c.characters);
    else if (page === 'zones') downloadJson('zones.json', c.zones);
    else downloadJson('organizations.json', c.organizations);
  };

  const importCurrent = async (file: File) => {
    try {
      const data = await readJsonFile<Entity[]>(file);
      if (page === 'events') c.setEvents(data as TimelineEvent[]);
      else if (page === 'characters') c.setCharacters(data as Character[]);
      else if (page === 'zones') c.setZones(data as Zone[]);
      else c.setOrganizations(data as Organization[]);
    } catch {
      alert('Не удалось прочитать JSON-файл.');
    }
  };

  const dataFile =
    page === 'events'
      ? 'events.json'
      : page === 'characters'
        ? 'characters.json'
        : page === 'zones'
          ? 'zones.json'
          : 'organizations.json';

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

  // данные для карточки фракции: состав, зоны влияния, летопись
  const orgMembers = useMemo(
    () =>
      activeOrg
        ? c.characters.filter((ch) => ch.affiliations.includes(activeOrg.name))
        : [],
    [activeOrg, c.characters],
  );
  const orgZones = useMemo(
    () => (activeOrg ? c.zones.filter((z) => z.factions.includes(activeOrg.name)) : []),
    [activeOrg, c.zones],
  );
  const orgChronicle = useMemo(() => {
    if (!activeOrg) return [];
    const out: { zoneId: string; zoneName: string; era: string; text: string }[] = [];
    for (const z of c.zones) {
      for (const ch of z.chronicle) {
        if (ch.faction === activeOrg.name && ch.text.trim()) {
          out.push({ zoneId: z.id, zoneName: z.name, era: ch.era, text: ch.text });
        }
      }
    }
    return out;
  }, [activeOrg, c.zones]);

  const closeAll = () => {
    setActiveEvent(null);
    setActiveCharacter(null);
    setActiveZone(null);
    setActiveOrg(null);
  };
  const openOrgChar = (id: string) => {
    const ch = charsById[id];
    if (!ch) return;
    setActiveOrg(null);
    setTimeout(() => setActiveCharacter(ch), 250);
  };
  const openOrgZone = (z: Zone) => {
    setActiveOrg(null);
    setTimeout(() => setActiveZone(z), 250);
  };

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
  const openFaction = (name: string) => {
    const org = c.organizations.find((o) => o.name === name);
    if (org) {
      // открыть детальную карточку фракции
      setActiveCharacter(null);
      setActiveZone(null);
      setActiveEvent(null);
      setTimeout(() => setActiveOrg(org), 250);
      return;
    }
    // нет такой организации — перейти на вкладку и подсветить (старое поведение)
    closeAll();
    setFactionTarget(name);
    setPage('organizations');
  };

  // ===== Дип-линки: синхронизация URL-хэша с открытым контентом =====
  const lookup = useRef({ eventsById, charsById, zones: c.zones, orgs: c.organizations });
  lookup.current = { eventsById, charsById, zones: c.zones, orgs: c.organizations };
  const bootHash = useRef(parseHash()); // снимок хэша на первом рендере
  const linkReady = useRef(false);

  const applyHash = (parsed: { kind: string; id?: string }) => {
    const { kind, id } = parsed;
    setActiveEvent(null);
    setActiveCharacter(null);
    setActiveZone(null);
    setActiveOrg(null);
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
    } else if (kind === 'faction' && id) {
      const o = lookup.current.orgs.find((x) => x.id === id);
      if (o) {
        setPage('organizations');
        setActiveOrg(o);
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
    else if (activeOrg) hash = `#/faction/${encodeURIComponent(activeOrg.id)}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }, [page, activeEvent, activeCharacter, activeZone, activeOrg]);

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
            {(isData || page === 'map') && (
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

            {isCloud ? (
              auth.email ? (
                <>
                  <span style={{ color: 'var(--parchment)', fontFamily: 'var(--font-body)' }}>
                    Правки сохраняются в <b>общее облако</b> — друзья увидят их при перезагрузке.
                    Вошли: <b>{auth.email}</b>
                  </span>
                  <button className="icon-btn" onClick={handleSeedCloud}>
                    ⬆ Залить всё в облако
                  </button>
                  <button className="icon-btn" onClick={handleSyncFromRepo}>
                    ⟳ Обновить из репозитория
                  </button>
                  <button className="icon-btn" onClick={exportCurrent}>
                    ⬇ Бэкап {dataFile}
                  </button>
                  <button className="icon-btn" onClick={() => void auth.signOut()}>
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <span style={{ color: 'var(--parchment)', fontFamily: 'var(--font-body)' }}>
                    Чтобы сохранять правки в общее облако, войди (логин-пароль выдаёт владелец):
                  </span>
                  <input
                    className="search-input"
                    style={{ minWidth: 180 }}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="username"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                  <input
                    className="search-input"
                    style={{ minWidth: 150 }}
                    type="password"
                    placeholder="пароль"
                    autoComplete="current-password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                  />
                  <button className="icon-btn active" onClick={handleSignIn}>
                    Войти
                  </button>
                </>
              )
            ) : (
              <>
                <span style={{ color: 'var(--parchment)', fontFamily: 'var(--font-body)' }}>
                  Клик по карточке — правка. Изменения хранятся локально; для публикации жми
                  «Экспорт» и положи <code>{dataFile}</code> в <code>public/data/</code>.
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
              </>
            )}

            {authMsg && (
              <span style={{ color: 'var(--titan-gold)', fontFamily: 'var(--font-body)' }}>
                {authMsg}
              </span>
            )}
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
            editMode={editMode}
            onZone={openForView.zones}
            onPlaceZone={saveZoneCoords}
          />
        )}
        {page === 'cosmology' && <CosmologyPage />}
        {page === 'pantheons' && <PantheonsPage />}
        {c.status === 'ready' && page === 'organizations' && (
          <OrganizationsPage
            organizations={c.organizations}
            onSelect={openForView.organizations}
            highlight={factionTarget}
            onHighlightDone={() => setFactionTarget(undefined)}
          />
        )}
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
        onFaction={openFaction}
      />
      <ZoneModal zone={activeZone} onClose={() => setActiveZone(null)} onFaction={openFaction} />
      <OrganizationModal
        organization={activeOrg}
        members={orgMembers}
        zones={orgZones}
        chronicle={orgChronicle}
        onClose={() => setActiveOrg(null)}
        onCharacter={openOrgChar}
        onZone={openOrgZone}
      />

      {/* Редактирование */}
      <EditModal
        type={isData ? (page as PageId) : 'events'}
        item={editing.item}
        open={editing.open}
        allCharacters={c.characters}
        allFactions={c.organizations.map((o) => o.name)}
        onClose={() => setEditing({ open: false, item: null })}
        onSave={saveEntity}
        onDelete={deleteEntity}
      />

      {syncToast && (
        <div className="sync-toast">✦ Хроники обновлены</div>
      )}
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
