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
  /** Биография (HTML) */
  biography: string;
  role: string;
  games: string[];
  books: string[];
  /** Связи с другими персонажами */
  relations: Relation[];
}

/** Запись летописи зоны для конкретной эпохи. */
export interface ZoneEra {
  era: string;
  text: string;
}

export interface Zone {
  id: string;
  name: string;
  region: string;
  /** Положение дел со стороны Альянса (HTML/текст) */
  alliance: string;
  /** Положение дел со стороны Орды (HTML/текст) */
  horde: string;
  /** Летопись зоны по эпохам */
  history: ZoneEra[];
  images: string[];
}

export type PageId = 'events' | 'characters' | 'zones';
