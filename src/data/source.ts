import type { Character, TimelineEvent, Zone } from './types';
import { supabase, isCloud } from './supabase';

// Источник данных. Читает из Supabase (если настроен), иначе — статические JSON
// из public/data. Один интерфейс для компонентов независимо от бэкенда.

export interface Content {
  events: TimelineEvent[];
  characters: Character[];
  zones: Zone[];
}

export type DatasetId = 'events' | 'characters' | 'zones';

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

// --- нормализация: гарантируем поля/массивы, чтобы битая запись не роняла UI ---
function normEvent(e: Partial<TimelineEvent>): TimelineEvent {
  return {
    id: String(e.id ?? cryptoId()),
    title: e.title ?? 'Без названия',
    period: e.period ?? '',
    sortYear: typeof e.sortYear === 'number' ? e.sortYear : 999999,
    era: e.era ?? '',
    description: e.description ?? '',
    sources: arr(e.sources),
    images: arr(e.images),
  };
}
function normCharacter(c: Partial<Character>): Character {
  return {
    id: String(c.id ?? cryptoId()),
    name: c.name ?? 'Безымянный',
    title: c.title ?? '',
    portrait: c.portrait ?? '',
    gender: c.gender ?? '',
    race: c.race ?? '',
    class: c.class ?? '',
    status: c.status ?? '',
    affiliations: arr(c.affiliations),
    biography: c.biography ?? '',
    role: c.role ?? '',
    games: arr(c.games),
    books: arr(c.books),
    relations: arr(c.relations),
  };
}
function normZone(z: Partial<Zone>): Zone {
  return {
    id: String(z.id ?? cryptoId()),
    name: z.name ?? 'Безымянная зона',
    region: z.region ?? '',
    alliance: z.alliance ?? '',
    horde: z.horde ?? '',
    history: arr(z.history),
    images: arr(z.images),
  };
}
function cryptoId(): string {
  return 'item-' + Math.random().toString(36).slice(2, 9);
}

function normalizeAll(events: unknown, characters: unknown, zones: unknown): Content {
  return {
    events: arr<Partial<TimelineEvent>>(events).map(normEvent).sort((a, b) => a.sortYear - b.sortYear),
    characters: arr<Partial<Character>>(characters).map(normCharacter),
    zones: arr<Partial<Zone>>(zones).map(normZone),
  };
}

// --- статический источник (public/data) ---
async function fetchJson(file: string): Promise<unknown> {
  const url = `${import.meta.env.BASE_URL}data/${file}`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Не удалось загрузить ${file}: HTTP ${res.status}`);
  return res.json();
}
async function fetchStatic(): Promise<Content> {
  const [events, characters, zones] = await Promise.all([
    fetchJson('events.json'),
    fetchJson('characters.json'),
    fetchJson('zones.json'),
  ]);
  return normalizeAll(events, characters, zones);
}

// --- облачный источник (Supabase) ---
async function fetchCloud(): Promise<Content | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('content').select('id,data');
  if (error) {
    console.warn('Supabase: чтение не удалось, фолбэк на статику —', error.message);
    return null;
  }
  if (!data || data.length === 0) return null; // облако ещё пустое
  const by: Record<string, unknown> = {};
  for (const row of data) by[(row as { id: string }).id] = (row as { data: unknown }).data;
  return normalizeAll(by.events, by.characters, by.zones);
}

/** Принудительно загрузить базовые данные из репозитория (public/data), минуя облако. */
export async function fetchRepo(): Promise<Content> {
  return fetchStatic();
}

/** Загрузка контента: облако (если есть данные), иначе статика. */
export async function fetchContent(): Promise<Content> {
  if (isCloud) {
    const cloud = await fetchCloud();
    if (cloud) return cloud;
  }
  return fetchStatic();
}

/** Запись датасета в облако (нужна авторизация; RLS пропустит только вошедших). */
export async function saveDataset(id: DatasetId, data: unknown[]): Promise<void> {
  if (!supabase) throw new Error('Облако (Supabase) не настроено');
  const { error } = await supabase
    .from('content')
    .upsert({ id, data, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

/** Залить все три датасета в облако (первичная инициализация). */
export async function seedCloud(content: Content): Promise<void> {
  await saveDataset('events', content.events);
  await saveDataset('characters', content.characters);
  await saveDataset('zones', content.zones);
}
