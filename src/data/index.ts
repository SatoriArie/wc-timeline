import type { Character, TimelineEvent, Zone } from './types';
import eventsJson from './events.json';
import charactersJson from './characters.json';
import zonesJson from './zones.json';

export const events: TimelineEvent[] = (eventsJson as TimelineEvent[])
  .slice()
  .sort((a, b) => a.sortYear - b.sortYear);

export const characters: Character[] = charactersJson as Character[];

export const zones: Zone[] = zonesJson as Zone[];

/** Быстрый доступ к персонажу по id (для ссылок из описаний событий). */
export const charactersById: Record<string, Character> = Object.fromEntries(
  characters.map((c) => [c.id, c]),
);

/** Порядок эпох в исходном файле — сохраняем хронологию глав. */
export const eraOrder: string[] = (eventsJson as TimelineEvent[]).reduce<string[]>(
  (acc, e) => (e.era && !acc.includes(e.era) ? [...acc, e.era] : acc),
  [],
);

/** Порядок регионов зон в исходном файле. */
export const regionOrder: string[] = (zonesJson as Zone[]).reduce<string[]>(
  (acc, z) => (z.region && !acc.includes(z.region) ? [...acc, z.region] : acc),
  [],
);
