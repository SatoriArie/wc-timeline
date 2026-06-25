// Тематические SVG-иконки. Используют currentColor — цвет задаётся через CSS.

import type { SourceType } from '../data/types';

interface IconProps {
  size?: number;
  className?: string;
}

/** Герб Альянса — геральдический щит с мечом. */
export function AllianceCrest({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M12 1.5 L20.5 4.5 V11 C20.5 16.4 16.8 20.6 12 22.5 C7.2 20.6 3.5 16.4 3.5 11 V4.5 Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M12 1.5 L20.5 4.5 V11 C20.5 16.4 16.8 20.6 12 22.5 C7.2 20.6 3.5 16.4 3.5 11 V4.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M12 5.5 V16 M9.4 7.5 H14.6 M10.5 16 H13.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Эмблема Орды — круг с тремя когтистыми отметинами. */
export function HordeCrest({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M7.5 6 C9 10 9.2 14 8.2 18 M12 5 C13 10 13 14 12 19 M16.5 6 C15 10 14.8 14 15.8 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Набор арканных сигилов для заголовков эпох — выбираются по индексу.
const SIGILS = [
  // солнце/титаны
  <g key="0">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 1 V5 M12 19 V23 M1 12 H5 M19 12 H23 M4 4 L7 7 M17 17 L20 20 M20 4 L17 7 M7 17 L4 20" />
  </g>,
  // меч/война
  <g key="1">
    <path d="M12 2 L12 16 M9 16 H15 M10.5 19 H13.5 M8 6 L12 2 L16 6" />
  </g>,
  // портал/магия
  <g key="2">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 3 V7 M12 17 V21 M3 12 H7 M17 12 H21" />
  </g>,
  // кристалл/артефакт
  <g key="3">
    <path d="M12 2 L19 9 L12 22 L5 9 Z M5 9 H19 M12 2 V22" />
  </g>,
  // глаз/пустота
  <g key="4">
    <path d="M2 12 C5 6 19 6 22 12 C19 18 5 18 2 12 Z" />
    <circle cx="12" cy="12" r="3.2" />
  </g>,
];

/* ===== Источники: иконки по типам ===== */

export const SOURCE_LABEL: Record<SourceType, string> = {
  book: 'Книга / комикс',
  game: 'Игра',
  quest: 'Квест',
  dungeon: 'Подземелье / локация',
};

const SOURCE_PATHS: Record<SourceType, JSX.Element> = {
  // раскрытая книга
  book: (
    <path d="M3 5c4-2 8-2 9 0 1-2 5-2 9 0v14c-4-2-8-2-9 0-1-2-5-2-9 0V5Zm9 0v14" />
  ),
  // игровой контроллер
  game: (
    <g>
      <rect x="2.5" y="8" width="19" height="9" rx="4.5" />
      <path d="M6.5 12.5h3M8 11v3" />
      <circle cx="15.5" cy="11.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.6" cy="13.6" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
  // квестовый маркер «!»
  quest: (
    <g>
      <path d="M12 2 22 12 12 22 2 12Z" />
      <path d="M12 7v6" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </g>
  ),
  // врата подземелья
  dungeon: <path d="M5 21V10a7 7 0 0 1 14 0v11M5 21h14M12 21v-7" />,
};

/** Иконка источника по типу. */
export function SourceIcon({ type, size = 16, className }: IconProps & { type: SourceType }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {SOURCE_PATHS[type]}
    </svg>
  );
}

/** Сигил эпохи по её порядковому индексу. */
export function EraSigil({ index = 0, size = 22, className }: IconProps & { index?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {SIGILS[index % SIGILS.length]}
    </svg>
  );
}
