import { assetUrl } from '../utils/asset';

// Миниатюры зон (как на classic+): имя нашей зоны → слаг файла в public/images/zones.
// Скриншоты wowhead/wiki, локально пожаты до ~640px. Фан-использование, © Blizzard.
const SLUGS: Record<string, string> = {
  'Тирисфальские леса': 'tirisfal',
  'Серебряный бор': 'silverpine',
  'Предгорья Хилсбрада': 'hillsbrad',
  'Альтеракские горы': 'alterac',
  'Нагорье Арати': 'arathi',
  'Внутренние земли': 'hinterlands',
  'Восточные Чумные земли': 'eplaguelands',
  'Западные Чумные земли': 'wplaguelands',
  Болотина: 'wetlands',
  'Лох Модан': 'lochmodan',
  'Тлеющие ушелье': 'searinggorge',
  'Пылающие Степи': 'burningsteppes',
  Красногорье: 'redridge',
  'Элвинский Лес': 'elwynn',
  'Западный край': 'westfall',
  'Сумеречный Лес': 'duskwood',
  'Болота Печали': 'swamp',
  'Выжженные Степи': 'blasted',
  'Перевал Мертвого Ветра': 'deadwind',
  'Тернистая Долина': 'stranglethorn',
  Тельдрассил: 'teldrassil',
  'Темные Берега': 'darkshore',
  'Оскверненный Лес': 'felwood',
  'Лунная Поляна': 'moonglade',
  'Зимние Ключи': 'winterspring',
  'Гора Хиджал': 'hyjal',
  'Ашенвальский Лес': 'ashenvale',
  Азшара: 'azshara',
  'Когтистые Горы': 'stonetalon',
  Степи: 'barrens',
  Дуротар: 'durotar',
  Пустоши: 'desolace',
  Мулгор: 'mulgore',
  'Пылевые Топи': 'dustwallow',
  Фералас: 'feralas',
  Силитус: 'silithus',
  'Кратер Унгоро': 'ungoro',
  'Ан’Кираж': 'ahnqiraj',
};

/** URL миниатюры зоны (или undefined, если нет). */
export function zoneThumb(name: string): string | undefined {
  const s = SLUGS[name];
  return s ? assetUrl(`images/zones/${s}.jpg`) : undefined;
}
