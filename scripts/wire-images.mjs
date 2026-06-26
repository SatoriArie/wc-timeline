// Сканирует public/images/{portraits,events,zones} и прописывает пути к картинкам
// в src/data/*.json по совпадению имени файла с id. Запуск: node scripts/wire-images.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG_EXT = /\.(jpe?g|png|webp|avif)$/i;

function filesIn(rel) {
  const dir = join(root, 'public/images', rel);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => IMG_EXT.test(f));
}

// id из имени файла: "arthas.jpg" -> "arthas"; "arthas-2.jpg" -> "arthas"
const idOf = (file) => file.replace(IMG_EXT, '').replace(/-\d+$/, '');

function groupById(rel) {
  const map = {};
  for (const f of filesIn(rel).sort()) {
    const id = idOf(f);
    (map[id] ??= []).push(`images/${rel}/${f}`);
  }
  return map;
}

function load(name) {
  return JSON.parse(readFileSync(join(root, 'public/data', name), 'utf8'));
}
function save(name, data) {
  writeFileSync(join(root, 'public/data', name), JSON.stringify(data, null, 2));
}

const portraits = groupById('portraits');
const eventImgs = groupById('events');
const zoneImgs = groupById('zones');

const characters = load('characters.json');
let cCount = 0;
for (const c of characters) {
  if (portraits[c.id]?.length) {
    c.portrait = portraits[c.id][0];
    cCount++;
  }
}

const events = load('events.json');
let eCount = 0;
for (const e of events) {
  if (eventImgs[e.id]?.length) {
    e.images = eventImgs[e.id];
    eCount++;
  }
}

const zones = load('zones.json');
let zCount = 0;
for (const z of zones) {
  if (zoneImgs[z.id]?.length) {
    z.images = zoneImgs[z.id];
    zCount++;
  }
}

save('characters.json', characters);
save('events.json', events);
save('zones.json', zones);

console.log(`✓ Портреты: ${cCount} персонажей`);
console.log(`✓ События:  ${eCount} с картинками`);
console.log(`✓ Зоны:     ${zCount} с картинками`);

// предупредить о файлах без совпадения id
const ids = {
  portraits: new Set(characters.map((c) => c.id)),
  events: new Set(events.map((e) => e.id)),
  zones: new Set(zones.map((z) => z.id)),
};
for (const [rel, set] of Object.entries(ids)) {
  for (const id of Object.keys(groupById(rel))) {
    if (!set.has(id)) console.warn(`⚠ ${rel}: нет id "${id}" в данных — файл проигнорирован`);
  }
}
