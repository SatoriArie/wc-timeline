// Единый источник истины по типам контента сайта.

/** Тип источника лора. */
export type SourceType = 'book' | 'game' | 'quest' | 'dungeon';

/** Источник с явно заданным типом (заполняется вручную). */
export interface SourceRef {
  text: string;
  type: SourceType;
}

export interface TimelineEvent {
  id: string;
  title: string;
  /** Отображаемый период, как в источнике: «-25000», «с -25000 до -16000», «?» */
  period: string;
  /** Числовое значение для сортировки; 999999 — период неизвестен */
  sortYear: number;
  /** Эпоха-глава, под которой сгруппировано событие */
  era: string;
  /** Описание события (может содержать HTML и ссылки на персонажей) */
  description: string;
  /** Источники лора с явно указанным типом */
  sources: SourceRef[];
  images: string[];
}

/** Тип связи между персонажами. */
export type RelationKind = 'ally' | 'enemy' | 'kin';

export interface Relation {
  /** id связанного персонажа */
  id: string;
  kind: RelationKind;
  /** краткое пояснение связи (необязательно) */
  note?: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  portrait: string;
  /** Пол (Мужской / Женский / —) */
  gender: string;
  /** Раса (Человек, Орк, Ночной эльф…) — изначальная/основная */
  race: string;
  /** Во что превратился (Демон, Нежить…) — необязательно; race → raceTransform */
  raceTransform: string;
  /** Класс (Паладин, Маг, Чернокнижник…) */
  class: string;
  /** Статус (Жив / Погиб / Нежить / Заточён…) */
  status: string;
  /** Принадлежность — фракции/ордены/организации */
  affiliations: string[];
  /** Биография (HTML) */
  biography: string;
  role: string;
  games: string[];
  books: string[];
  /** Связи с другими персонажами */
  relations: Relation[];
}

/** Запись летописи зоны: что делала фракция в конкретную эпоху. */
export interface ZoneChronicle {
  /** Фракция/орден (пусто = общая история зоны) */
  faction: string;
  /** Эпоха/дополнение (пусто = вне эпох) */
  era: string;
  text: string;
}

export interface Zone {
  id: string;
  name: string;
  region: string;
  /** Принадлежность — фракции/ордены, оперировавшие в зоне */
  factions: string[];
  /** Обитатели — расы и существа */
  inhabitants: string[];
  /** Правители */
  rulers: string[];
  /** Крупные поселения */
  settlementsMajor: string[];
  /** Малые поселения */
  settlementsMinor: string[];
  /** Летопись: фракция × эпоха */
  chronicle: ZoneChronicle[];
  images: string[];
}

/** Фракция / орден / организация (редактируемая сущность). */
export interface Organization {
  id: string;
  name: string;
  /** Категория для группировки (напр. «Силы Альянса») */
  category: string;
  /** Краткий эпитет/тип */
  domain: string;
  /** Описание */
  note: string;
  /** Цветовой акцент */
  color: string;
}

export type PageId = 'events' | 'characters' | 'zones' | 'organizations';
