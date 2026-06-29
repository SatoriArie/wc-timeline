import type { MapPin, MapPinCategory } from './types';

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

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '');

/** Стартовый набор точек, привязанных к нашим зонам (по имени). Расширяется вручную. */
const seed: Omit<MapPin, 'id'>[] = [
  // столицы / полёты
  { title: 'Штормград', category: 'flight_path', zone: 'Элвинский Лес', score: 95 },
  { title: 'Стальгорн', category: 'flight_path', zone: 'Дун Морог', score: 82 },
  { title: 'Подгород', category: 'flight_path', zone: 'Тирисфальские леса', score: 80 },
  { title: 'Оргриммар', category: 'flight_path', zone: 'Дуротар', score: 92 },
  { title: 'Громовой Утёс', category: 'flight_path', zone: 'Мулгор', score: 70 },
  { title: 'Дарнас', category: 'flight_path', zone: 'Тельдрассил', score: 72 },
  // подземелья
  { title: 'Мёртвые копи', category: 'dungeon', zone: 'Западный край', score: 75 },
  { title: 'Монастырь Алого ордена', category: 'dungeon', zone: 'Тирисфальские леса', score: 84 },
  { title: 'Гномреган', category: 'dungeon', zone: 'Дун Морог', score: 60 },
  { title: 'Ульдаман', category: 'dungeon', zone: 'Бесплодные Земли', score: 55 },
  { title: 'Зул’Фаррак', category: 'dungeon', zone: 'Танарис', score: 58 },
  { title: 'Мараудон', category: 'dungeon', zone: 'Пустоши', score: 50 },
  { title: 'Пещеры Стенаний', category: 'dungeon', zone: 'Степи', score: 52 },
  // рейды
  { title: 'Огненные Недра', category: 'raid', zone: 'Пылающие Степи', score: 90 },
  { title: 'Логово Крыла Тьмы', category: 'raid', zone: 'Пылающие Степи', score: 76 },
  { title: 'Логово Ониксии', category: 'raid', zone: 'Пылевые Топи', score: 74 },
  { title: 'Храм Ан’Кираж', category: 'raid', zone: 'Ан’Кираж', score: 85 },
  { title: 'Руины Ан’Кираж', category: 'raid', zone: 'Силитус', score: 60 },
  // мировые боссы
  { title: 'Лорд Каззак', category: 'world_boss', zone: 'Выжженные Степи', score: 66 },
  { title: 'Азурегос', category: 'world_boss', zone: 'Азшара', score: 57 },
  // pvp
  { title: 'Альтеракская долина', category: 'pvp', zone: 'Альтеракские горы', score: 71 },
  { title: 'Ущелье Песни Войны', category: 'pvp', zone: 'Ашенвальский Лес', score: 63 },
  { title: 'Низина Арати', category: 'pvp', zone: 'Нагорье Арати', score: 66 },
  // события мира
  { title: 'Врата гнева', category: 'world_event', zone: 'Силитус', score: 68 },
  // лор
  { title: 'Каражан', category: 'lore', zone: 'Перевал Мертвого Ветра', score: 64 },
  { title: 'Лунная поляна', category: 'lore', zone: 'Лунная Поляна', score: 46 },
  // задания
  { title: 'Тайна кратера Унгоро', category: 'quest', zone: 'Кратер Унгоро', score: 42 },
  { title: 'Проклятие Сумеречного леса', category: 'quest', zone: 'Сумеречный Лес', score: 40 },
];

export const curatedPins: MapPin[] = seed.map((p) => ({
  ...p,
  id: `pin-${slug(p.category)}-${slug(p.title)}`,
}));
