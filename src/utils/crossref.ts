import type { Character, TimelineEvent } from '../data/types';

/**
 * Вычисляет переплетение лора: какие персонажи упоминаются в каждом событии
 * и в каких событиях встречается каждый персонаж. Совпадение — по полному имени
 * и по первому слову имени (если оно достаточно длинное, чтобы не давать ложных
 * срабатываний).
 */
export interface CrossRefs {
  charactersByEvent: Record<string, string[]>; // eventId -> characterId[]
  eventsByCharacter: Record<string, string[]>; // characterId -> eventId[]
}

function aliasesFor(name: string): string[] {
  const first = name.split(/[\s’'`]/)[0];
  const set = new Set<string>([name.toLowerCase()]);
  if (first.length >= 4) set.add(first.toLowerCase());
  return [...set];
}

export function computeCrossRefs(events: TimelineEvent[], characters: Character[]): CrossRefs {
  const charAliases = characters.map((c) => ({ id: c.id, aliases: aliasesFor(c.name) }));
  const charactersByEvent: Record<string, string[]> = {};
  const eventsByCharacter: Record<string, string[]> = {};

  for (const e of events) {
    const hay = `${e.title}\n${e.description}`.toLowerCase();
    const ids: string[] = [];
    for (const c of charAliases) {
      if (c.aliases.some((a) => hay.includes(a))) {
        ids.push(c.id);
        (eventsByCharacter[c.id] ??= []).push(e.id);
      }
    }
    charactersByEvent[e.id] = ids;
  }

  return { charactersByEvent, eventsByCharacter };
}
