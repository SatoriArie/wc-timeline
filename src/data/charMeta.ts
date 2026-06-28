// Справочники для карточки персонажа: пол, класс (с иконками), расы.
import { assetUrl } from '../utils/asset';

/** Варианты пола. */
export const genderOptions = ['Мужской', 'Женский', 'Иной'];

/** Класс WoW: русское имя + слаг файла иконки (public/images/classes/<slug>.png). */
export interface ClassDef {
  name: string;
  slug: string;
}

export const classOptions: ClassDef[] = [
  { name: 'Воин', slug: 'warrior' },
  { name: 'Паладин', slug: 'paladin' },
  { name: 'Охотник', slug: 'hunter' },
  { name: 'Разбойник', slug: 'rogue' },
  { name: 'Жрец', slug: 'priest' },
  { name: 'Рыцарь смерти', slug: 'deathknight' },
  { name: 'Шаман', slug: 'shaman' },
  { name: 'Маг', slug: 'mage' },
  { name: 'Чернокнижник', slug: 'warlock' },
  { name: 'Монах', slug: 'monk' },
  { name: 'Друид', slug: 'druid' },
  { name: 'Охотник на демонов', slug: 'demonhunter' },
  { name: 'Призыватель', slug: 'evoker' },
];

const classBySlug = new Map(classOptions.map((c) => [c.slug, c]));
const classByName = new Map(classOptions.map((c) => [c.name.toLowerCase(), c]));

/** Найти определение класса по имени (рус.) или слагу — терпимо к регистру. */
export function findClass(value: string | undefined): ClassDef | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return classByName.get(v) ?? classBySlug.get(v) ?? null;
}

/** URL иконки класса или null, если класс нестандартный. */
export function classIcon(value: string | undefined): string | null {
  const def = findClass(value);
  return def ? assetUrl(`images/classes/${def.slug}.png`) : null;
}

/** Подсказки рас (datalist) — базовые + «трансформированные». */
export const raceOptions = [
  'Человек',
  'Высший эльф',
  'Ночной эльф',
  'Кровавый эльф',
  'Дворф',
  'Гном',
  'Дреней',
  'Ворген',
  'Пандарен',
  'Орк',
  'Тролль',
  'Таурен',
  'Нежить',
  'Гоблин',
  'Демон',
  'Натрезим (Повелитель ужаса)',
  'Эредар',
  'Сатир',
  'Мурлок',
  'Дракон',
  'Драконид',
  'Титан',
  'Древний бог',
  'Элементаль',
  'Наг',
  'Огр',
];
