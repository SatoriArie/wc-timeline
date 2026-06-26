import type { Character, TimelineEvent, Zone } from './types';

// Источник данных. Сейчас читает статические JSON из public/data рантаймом;
// этот же интерфейс позже подменяется на Supabase без правок компонентов.

export interface Content {
  events: TimelineEvent[];
  characters: Character[];
  zones: Zone[];
}

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

// Нормализация: гарантируем наличие массивов/полей, чтобы битые записи не роняли UI.
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

async function fetchJson(file: string): Promise<unknown> {
  const url = `${import.meta.env.BASE_URL}data/${file}`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Не удалось загрузить ${file}: HTTP ${res.status}`);
  return res.json();
}

export async function fetchContent(): Promise<Content> {
  const [events, characters, zones] = await Promise.all([
    fetchJson('events.json'),
    fetchJson('characters.json'),
    fetchJson('zones.json'),
  ]);
  return {
    events: arr<Partial<TimelineEvent>>(events).map(normEvent).sort((a, b) => a.sortYear - b.sortYear),
    characters: arr<Partial<Character>>(characters).map(normCharacter),
    zones: arr<Partial<Zone>>(zones).map(normZone),
  };
}
