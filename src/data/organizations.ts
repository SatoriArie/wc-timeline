// Метаданные категорий фракций (порядок групп + цвет + вступление).
// Сами организации — редактируемые сущности в public/data/organizations.json (через облако).

export interface OrgCategory {
  name: string;
  accent: string;
  intro: string;
}

export const orgCategories: OrgCategory[] = [
  {
    name: 'Силы Альянса',
    accent: '#5b8def',
    intro: 'Государства и ордены, что встали под знамёна Альянса ради защиты Азерота.',
  },
  {
    name: 'Силы Орды',
    accent: '#c0392b',
    intro: 'Народы, объединённые под знаменем Орды — от орков до Отрёкшихся.',
  },
  {
    name: 'Нейтральные ордены',
    accent: '#ffcf57',
    intro: 'Те, кто служит не фракции, а самому Азероту — или собственному пути.',
  },
  {
    name: 'Тёмные силы',
    accent: '#a566ff',
    intro: 'Культы, легионы и твари, несущие Азероту погибель.',
  },
];

export const orgCategoryOrder: string[] = orgCategories.map((c) => c.name);

/** Цвет/вступление категории (с дефолтом для новых категорий). */
export function categoryMeta(name: string): OrgCategory {
  return orgCategories.find((c) => c.name === name) ?? { name, accent: '#b58b4a', intro: '' };
}
