import type { MapPinCategory } from './types';

export interface PinCategoryMeta {
  id: MapPinCategory;
  label: string;
  color: string;
  glyph: string;
}

/** 9 категорий точек — как на classic+. */
export const PIN_CATEGORIES: PinCategoryMeta[] = [
  { id: 'zone', label: 'Зоны', color: '#d49a3a', glyph: '🏳' },
  { id: 'flight_path', label: 'Столицы', color: '#6fd06f', glyph: '🦅' },
  { id: 'dungeon', label: 'Подземелья', color: '#7db4d8', glyph: '🗝' },
  { id: 'raid', label: 'Рейды', color: '#b06ad8', glyph: '💀' },
  { id: 'world_boss', label: 'Мировые боссы', color: '#d8503a', glyph: '🐲' },
  { id: 'pvp', label: 'PvP', color: '#e07a3a', glyph: '⚔' },
  { id: 'quest', label: 'Задания', color: '#e8c84b', glyph: '❗' },
  { id: 'lore', label: 'Лор', color: '#c8a96a', glyph: '📜' },
  { id: 'world_event', label: 'События мира', color: '#5cc8ff', glyph: '✦' },
];

const byId = new Map(PIN_CATEGORIES.map((c) => [c.id, c]));
export const pinCategoryMeta = (id: MapPinCategory): PinCategoryMeta =>
  byId.get(id) ?? PIN_CATEGORIES[0];

// Стартовый набор точек теперь живёт в public/data/pins.json (редактируемый датасет).
