// Канонический порядок эпох и регионов — статический конфиг.
// Не зависит от порядка строк в данных; новые/неизвестные значения
// сортируются в конец (indexOf === -1 обрабатывается в компонентах).

export const eraOrder: string[] = [
  'Сотворение Миров. Пантеон и Пылающий Легион',
  'Война древних',
  'Рождение Орды и открытие Темного портала',
  'Первая Война. Вторжение Орды',
  'Вторая Война. Альянс Лордерона',
  'Третяя Война. Восхождение Короля-Лича',
  'World of Warcraft',
  'Burning Crusade',
  'Гнев Короля Лича',
  'Катаклизм',
  'Mists of Pandaria',
  'Warlords of Draenor',
  'Legion',
  'Battle for Azeroth',
  'Shadowlands',
  'Dragonflight',
  'The War Within',
  'Midnight',
  'Last Titan',
];

/** Цвет-айдентика каждой эпохи/дополнения (для фоновых блоков летописи). */
export const eraTheme: Record<string, string> = {
  'Сотворение Миров. Пантеон и Пылающий Легион': '#5cc8ff',
  'Война древних': '#7CFC4E',
  'Рождение Орды и открытие Темного портала': '#7CFC4E',
  'Первая Война. Вторжение Орды': '#c0392b',
  'Вторая Война. Альянс Лордерона': '#4a78d6',
  'Третяя Война. Восхождение Короля-Лича': '#4fd6c4',
  'World of Warcraft': '#c79a4e',
  'Burning Crusade': '#7CFC4E',
  'Гнев Короля Лича': '#7fd9ff',
  Катаклизм: '#e8622c',
  'Mists of Pandaria': '#3fbf6f',
  'Warlords of Draenor': '#b06a3a',
  Legion: '#5fe06f',
  'Battle for Azeroth': '#e8b84b',
  Shadowlands: '#7a5cff',
  Dragonflight: '#36c98f',
  'The War Within': '#6fa8d6',
  Midnight: '#9c4fd6',
  'Last Titan': '#ffcf57',
};

/** Короткое имя эпохи (до первой точки) — для бейджей. */
export const shortEra = (era: string): string => era.split('.')[0].trim();

export const regionOrder: string[] = [
  'Лордерон',
  'Каз Модан',
  'Азерот',
  'Северный Калимдор',
  'Центральный Калимдор',
  'Южный Калимдор',
];
