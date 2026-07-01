# Faction Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the faction detail modal (`OrganizationModal`) with a full page (`FactionPage`) that shows a real emblem, curated leaders and members (with a "former" flag), while keeping the existing auto-derived "Зоны влияния" and "Летопись фракции" sections unchanged.

**Architecture:** `Organization` gains `emblem`/`leaders`/`members` fields. Leaders/members are manually curated `{id, former?}` lists resolved against `Character[]` in `App.tsx` and rendered by a new `FactionPage` component that replaces `OrganizationsPage` in-place (not an overlay) whenever a faction is selected. Editing gets a reusable character-picker (modeled on the existing `RelationsEditor`) for leaders/members, plus a plain "emblem URL" field like `character.portrait`.

**Tech Stack:** React 18 + TypeScript (strict) + Vite. No test framework exists in this repo — verification is `npx tsc -b` (type-check) plus manual QA in the running dev server.

## Global Constraints

- No unit test framework in this repo (`package.json` has no jest/vitest) — do not introduce one for this feature. Verify with `npx tsc -b` and manual browser QA only.
- `tsconfig.json` has `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true` — every import must be used, no dead variables.
- UI copy is Russian, matching the existing site (see any user-facing string you add).
- Reuse existing CSS classes/components where the shape already matches (`char-aside`, `char-meta`, `ref-list`/`ref-chip`, `tag-row`/`affil-tag`, `zone-chronicle`/`chron-era`, `RelationsEditor`-style row layout) — do not duplicate styles that already exist.
- "Территории влияния" (curated zone list) is explicitly OUT of scope for this plan — do not touch the existing auto-derived "Зоны влияния" logic (`zone.factions.includes(org.name)`).
- Deep link format `#/faction/<id>` must keep working exactly as-is.

---

### Task 1: Data model, normalizer, and edit form (emblem + leaders/members)

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/data/source.ts`
- Modify: `src/data/index.ts`
- Modify: `src/components/EditModal.tsx`

**Interfaces:**
- Produces: `OrgMember { id: string; former?: boolean }` (exported from `src/data/types.ts`, re-exported from `src/data/index.ts`)
- Produces: `Organization` gains `emblem?: string`, `leaders: OrgMember[]`, `members: OrgMember[]`
- Produces: `normOrg(o: Partial<Organization>): Organization` in `source.ts` now fills `emblem`/`leaders`/`members` with safe defaults
- Consumes: nothing new (first task)

- [ ] **Step 1: Add `OrgMember` and extend `Organization` in `src/data/types.ts`**

Find the existing `Organization` interface (currently the block right before `export type PageId = ...`):

```ts
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
```

Replace it with:

```ts
/** Запись главы/участника фракции: ссылка на персонажа + флаг "бывший". */
export interface OrgMember {
  id: string;
  former?: boolean;
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
  /** Герб/эмблема — путь к изображению (как character.portrait) */
  emblem?: string;
  /** Глава(ы) фракции — курируется вручную, с учётом бывших */
  leaders: OrgMember[];
  /** Состав фракции — курируется вручную, с учётом бывших */
  members: OrgMember[];
}
```

- [ ] **Step 2: Update `normOrg` in `src/data/source.ts` to default and validate the new fields**

Add this import at the top of `src/data/source.ts` (extend the existing type import):

```ts
import type { Character, MapPin, Organization, OrgMember, TimelineEvent, Zone } from './types';
```

Add a helper right above `normOrg` and rewrite `normOrg`:

```ts
function normOrgMember(m: unknown): OrgMember | null {
  if (!m || typeof m !== 'object') return null;
  const id = (m as Partial<OrgMember>).id;
  if (typeof id !== 'string' || !id) return null;
  return (m as Partial<OrgMember>).former ? { id, former: true } : { id };
}
function normOrg(o: Partial<Organization>): Organization {
  return {
    id: String(o.id ?? cryptoId()),
    name: o.name ?? 'Без названия',
    category: o.category ?? 'Прочее',
    domain: o.domain ?? '',
    note: o.note ?? '',
    color: o.color ?? '#b58b4a',
    emblem: o.emblem ?? '',
    leaders: arr<unknown>(o.leaders)
      .map(normOrgMember)
      .filter((m): m is OrgMember => m !== null),
    members: arr<unknown>(o.members)
      .map(normOrgMember)
      .filter((m): m is OrgMember => m !== null),
  };
}
```

- [ ] **Step 3: Re-export `OrgMember` from the data facade**

In `src/data/index.ts`, find:

```ts
export type {
  Character,
  TimelineEvent,
  Zone,
  SourceRef,
  SourceType,
  ZoneChronicle,
  Organization,
  Relation,
  RelationKind,
  PageId,
  MapPin,
  MapPinCategory,
} from './types';
```

Add `OrgMember` to that list (after `Organization`):

```ts
export type {
  Character,
  TimelineEvent,
  Zone,
  SourceRef,
  SourceType,
  ZoneChronicle,
  Organization,
  OrgMember,
  Relation,
  RelationKind,
  PageId,
  MapPin,
  MapPinCategory,
} from './types';
```

- [ ] **Step 4: Run the type-checker — expect it to fail in `EditModal.tsx`**

Run: `npx tsc -b`
Expected: FAIL — error in `src/components/EditModal.tsx` about the object literal for `organizations` missing `leaders`/`members` (`satisfies Organization` failing). This confirms the new required fields are wired through the type system.

- [ ] **Step 5: Add emblem field + leader/member picker state to `EditModal.tsx`**

Add `OrgMember` to the type import at the top of `src/components/EditModal.tsx`:

```ts
import type {
  Character,
  Organization,
  OrgMember,
  PageId,
  Relation,
  RelationKind,
  SourceRef,
  SourceType,
  TimelineEvent,
  Zone,
  ZoneChronicle,
} from '../data/types';
```

Add the `assetUrl` import (used for the emblem preview):

```ts
import { assetUrl } from '../utils/asset';
```

Inside the `EditModal` component, next to the existing `const [relations, setRelations] = useState<Relation[]>([]);` line, add:

```ts
const [orgLeaders, setOrgLeaders] = useState<OrgMember[]>([]);
const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
```

In the `useEffect`, find the `else` branch that builds the organizations form (currently ends the `if/else if` chain):

```ts
} else {
  const o = item as Organization | null;
  setForm({
    name: o?.name ?? '',
    category: o?.category ?? '',
    domain: o?.domain ?? '',
    note: o?.note ?? '',
    color: o?.color ?? '#b58b4a',
  });
}
```

Replace with:

```ts
} else {
  const o = item as Organization | null;
  setForm({
    name: o?.name ?? '',
    category: o?.category ?? '',
    domain: o?.domain ?? '',
    note: o?.note ?? '',
    color: o?.color ?? '#b58b4a',
    emblem: o?.emblem ?? '',
  });
  setOrgLeaders(o?.leaders?.length ? o.leaders.map((m) => ({ ...m })) : []);
  setOrgMembers(o?.members?.length ? o.members.map((m) => ({ ...m })) : []);
}
```

In `handleSave`, find the organizations branch:

```ts
} else {
  result = {
    id: (item as Organization)?.id ?? slug(form.name),
    name: form.name,
    category: form.category,
    domain: form.domain,
    note: form.note,
    color: form.color || '#b58b4a',
  } satisfies Organization;
}
```

Replace with:

```ts
} else {
  result = {
    id: (item as Organization)?.id ?? slug(form.name),
    name: form.name,
    category: form.category,
    domain: form.domain,
    note: form.note,
    color: form.color || '#b58b4a',
    emblem: form.emblem,
    leaders: orgLeaders.filter((m) => m.id),
    members: orgMembers.filter((m) => m.id),
  } satisfies Organization;
}
```

- [ ] **Step 6: Run the type-checker — expect it to pass**

Run: `npx tsc -b`
Expected: PASS (no errors). If it still fails, re-check Step 5 was applied to the correct branch (organizations, the final `else`).

- [ ] **Step 7: Add the emblem field and leader/member pickers to the organizations form JSX**

In `src/components/EditModal.tsx`, find the `{type === 'organizations' && (...)}` block:

```tsx
{type === 'organizations' && (
  <>
    <Field label="Название" value={form.name} onChange={(v) => set('name', v)} />
    <Field label="Категория" value={form.category} onChange={(v) => set('category', v)} list="orgcats" />
    <Field label="Тип / эпитет" value={form.domain} onChange={(v) => set('domain', v)} />
    <Area label="Описание" value={form.note} onChange={(v) => set('note', v)} rows={4} />
    <label className="form-row">
      <span>Цвет акцента</span>
      <input
        type="color"
        className="color-input"
        value={form.color || '#b58b4a'}
        onChange={(e) => set('color', e.target.value)}
      />
    </label>
  </>
)}
```

Replace with:

```tsx
{type === 'organizations' && (
  <>
    <Field label="Название" value={form.name} onChange={(v) => set('name', v)} />
    <Field label="Категория" value={form.category} onChange={(v) => set('category', v)} list="orgcats" />
    <Field label="Тип / эпитет" value={form.domain} onChange={(v) => set('domain', v)} />
    <Area label="Описание" value={form.note} onChange={(v) => set('note', v)} rows={4} />
    <label className="form-row">
      <span>Цвет акцента</span>
      <input
        type="color"
        className="color-input"
        value={form.color || '#b58b4a'}
        onChange={(e) => set('color', e.target.value)}
      />
    </label>
    <Field label="Герб (URL)" value={form.emblem} onChange={(v) => set('emblem', v)} />
    {form.emblem && <img className="emblem-preview" src={assetUrl(form.emblem)} alt="" />}
    <MemberPickerEditor
      label="Глава(ы) фракции"
      members={orgLeaders}
      onChange={setOrgLeaders}
      characters={allCharacters}
    />
    <MemberPickerEditor
      label="Состав фракции"
      members={orgMembers}
      onChange={setOrgMembers}
      characters={allCharacters}
    />
  </>
)}
```

- [ ] **Step 8: Add the `MemberPickerEditor` helper component**

In `src/components/EditModal.tsx`, add this new function after `RelationsEditor` (right before `function ZoneChronicleEditor`):

```tsx
function MemberPickerEditor({
  label,
  members,
  onChange,
  characters,
}: {
  label: string;
  members: OrgMember[];
  onChange: (m: OrgMember[]) => void;
  characters: Character[];
}) {
  const update = (i: number, patch: Partial<OrgMember>) =>
    onChange(members.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const remove = (i: number) => onChange(members.filter((_, idx) => idx !== i));
  const add = () => onChange([...members, { id: characters[0]?.id ?? '' }]);

  return (
    <div className="form-row">
      <span>{label}</span>
      <div className="source-editor">
        {members.map((m, i) => (
          <div className="rel-row" key={i}>
            <select
              className="source-type rel-row-char"
              value={m.id}
              onChange={(e) => update(i, { id: e.target.value })}
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label className="member-former-toggle">
              <input
                type="checkbox"
                checked={!!m.former}
                onChange={(e) => update(i, { former: e.target.checked || undefined })}
              />
              Бывший
            </label>
            <button type="button" className="source-del" onClick={() => remove(i)} title="Удалить">
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="source-add" onClick={add}>
          + Добавить
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Run the type-checker one more time**

Run: `npx tsc -b`
Expected: PASS.

- [ ] **Step 10: Add CSS for the emblem preview and former-toggle**

In `src/styles/global.css`, add after the `.rel-row-char { flex: 1; }` line (in the "редактор связей" section):

```css
.emblem-preview {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #c0a06a;
  background: #1a2438;
  margin-top: 6px;
}
.member-former-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: var(--ink-dark);
  white-space: nowrap;
}
```

- [ ] **Step 11: Manual QA in the browser**

Run: `npm run dev`
Open the app, go to «Фракции», click «✎ Редактировать», click any faction card. Confirm:
- A «Герб (URL)» field is visible; typing a URL shows a preview image below it.
- «Глава(ы) фракции» and «Состав фракции» sections each show a "+ Добавить" button; clicking it adds a row with a character `<select>` and a «Бывший» checkbox.
- Toggling the checkbox and removing rows works.
- Saving does not throw a console error (check with browser devtools).

- [ ] **Step 12: Commit**

```bash
git add src/data/types.ts src/data/source.ts src/data/index.ts src/components/EditModal.tsx src/styles/global.css
git commit -m "feat(factions): add emblem/leaders/members to Organization + edit form"
```

---

### Task 2: Emblem wiring in `wire-images.mjs`

**Files:**
- Modify: `scripts/wire-images.mjs`

**Interfaces:**
- Consumes: `public/data/organizations.json` (array of `Organization`, from Task 1's shape)
- Produces: same script, now also writes `org.emblem` when a matching file exists in `public/images/emblems/`

- [ ] **Step 1: Add the `emblems` group and organizations pass**

In `scripts/wire-images.mjs`, after the line `const zoneImgs = groupById('zones');`, add:

```js
const emblems = groupById('emblems');
```

After the `zones` block (`const zones = load('zones.json'); ... zCount++; }`), add a new block before the `save(...)` calls:

```js
const organizations = load('organizations.json');
let oCount = 0;
for (const o of organizations) {
  if (emblems[o.id]?.length) {
    o.emblem = emblems[o.id][0];
    oCount++;
  }
}
```

Update the `save(...)` calls to also persist organizations, and the console summary:

```js
save('characters.json', characters);
save('events.json', events);
save('zones.json', zones);
save('organizations.json', organizations);

console.log(`✓ Портреты: ${cCount} персонажей`);
console.log(`✓ События:  ${eCount} с картинками`);
console.log(`✓ Зоны:     ${zCount} с картинками`);
console.log(`✓ Гербы:    ${oCount} фракций`);
```

Update the trailing "no id match" warning loop's `ids` map to include organizations:

```js
const ids = {
  portraits: new Set(characters.map((c) => c.id)),
  events: new Set(events.map((e) => e.id)),
  zones: new Set(zones.map((z) => z.id)),
  emblems: new Set(organizations.map((o) => o.id)),
};
```

- [ ] **Step 2: Run the script and confirm it doesn't crash with zero emblem files**

Run: `node scripts/wire-images.mjs`
Expected: prints the four `✓ ...` lines with `✓ Гербы: 0 фракций` (no `public/images/emblems/` directory exists yet, so `groupById` returns `{}` and the loop is a no-op) — no thrown errors.

- [ ] **Step 3: Confirm `organizations.json` is unchanged when no emblem files exist**

Run: `git diff --stat public/data/organizations.json`
Expected: empty output (no diff) — the script only rewrites the file with the same content when nothing matched.

- [ ] **Step 4: Commit**

```bash
git add scripts/wire-images.mjs
git commit -m "feat(factions): wire emblem images by id in wire-images.mjs"
```

---

### Task 3: Faction card preview shows the real emblem

**Files:**
- Modify: `src/components/OrganizationsPage.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `Organization.emblem` (from Task 1)
- Produces: no new exports — visual-only change to the existing `OrganizationsPage` component

- [ ] **Step 1: Import `assetUrl` in `OrganizationsPage.tsx`**

At the top of `src/components/OrganizationsPage.tsx`, add:

```ts
import { assetUrl } from '../utils/asset';
```

- [ ] **Step 2: Swap the letter avatar for the emblem image**

Find:

```tsx
<span className="member-glyph">{o.name.charAt(0)}</span>
```

Replace with:

```tsx
{o.emblem ? (
  <img className="member-emblem-img" src={assetUrl(o.emblem)} alt={o.name} />
) : (
  <span className="member-glyph">{o.name.charAt(0)}</span>
)}
```

- [ ] **Step 3: Add the emblem image CSS**

In `src/styles/global.css`, add right after the `.member-glyph { ... }` block:

```css
.member-emblem-img {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--mc);
  box-shadow: 0 0 16px color-mix(in srgb, var(--mc) 60%, transparent);
}
```

- [ ] **Step 4: Run the type-checker**

Run: `npx tsc -b`
Expected: PASS.

- [ ] **Step 5: Manual QA in the browser**

Run: `npm run dev`
Open «Фракции». Since no faction has an `emblem` yet, every card should still show the letter avatar exactly as before (no visual regression). Use devtools to temporarily set one org's `emblem` via the edit form (Task 1's field) to any public image URL and confirm the card switches to showing that image in a circle.

- [ ] **Step 6: Commit**

```bash
git add src/components/OrganizationsPage.tsx src/styles/global.css
git commit -m "feat(factions): show real emblem on faction preview cards"
```

---

### Task 4: `FactionPage` component + `App.tsx` wiring (replace modal with a full page)

**Files:**
- Create: `src/components/FactionPage.tsx`
- Delete: `src/components/OrganizationModal.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `Organization`, `Character`, `Zone` (from `src/data/types.ts`); `eraOrder`, `eraTheme`, `shortEra`, `categoryMeta` (from `src/data`); `assetUrl` (from `src/utils/asset`)
- Produces: `FactionPage` component with props `{ organization: Organization; leaders: { character: Character; former?: boolean }[]; members: { character: Character; former?: boolean }[]; zones: Zone[]; chronicle: { zoneId: string; zoneName: string; era: string; text: string }[]; onBack: () => void; onCharacter: (id: string) => void; onZone: (z: Zone) => void }`

- [ ] **Step 1: Create `src/components/FactionPage.tsx`**

```tsx
import type { Character, Organization, Zone } from '../data/types';
import { eraOrder, eraTheme, shortEra, categoryMeta } from '../data';
import { assetUrl } from '../utils/asset';

interface ChronicleEntry {
  zoneId: string;
  zoneName: string;
  era: string;
  text: string;
}

interface MemberView {
  character: Character;
  former?: boolean;
}

interface Props {
  organization: Organization;
  leaders: MemberView[];
  members: MemberView[];
  zones: Zone[];
  chronicle: ChronicleEntry[];
  onBack: () => void;
  onCharacter: (id: string) => void;
  onZone: (z: Zone) => void;
}

const paras = (text: string) =>
  text
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p, i) => <p key={i}>{p}</p>);

function eraRank(era: string): number {
  if (!era) return -1;
  const i = eraOrder.indexOf(era);
  return i === -1 ? 9999 : i;
}

export default function FactionPage({
  organization,
  leaders,
  members,
  zones,
  chronicle,
  onBack,
  onCharacter,
  onZone,
}: Props) {
  const groups: { era: string; entries: ChronicleEntry[] }[] = [];
  const byEra = new Map<string, ChronicleEntry[]>();
  for (const e of chronicle) {
    if (!e.text.trim()) continue;
    if (!byEra.has(e.era)) byEra.set(e.era, []);
    byEra.get(e.era)!.push(e);
  }
  for (const [era, entries] of [...byEra.entries()].sort((a, b) => eraRank(a[0]) - eraRank(b[0]))) {
    groups.push({ era, entries });
  }

  const accent = organization.color || '#b58b4a';
  const meta = categoryMeta(organization.category);

  return (
    <div className="faction-page" style={{ ['--accent' as string]: accent }}>
      <button className="faction-back" onClick={onBack}>
        ← Назад к фракциям
      </button>

      <h1 className="page-title">{organization.name}</h1>
      <span className="modal-subtitle">
        {[organization.domain, organization.category].filter(Boolean).join(' · ')}
      </span>
      <div className="modal-divider" />

      <div className="char-aside">
        {organization.emblem ? (
          <img className="faction-emblem-lg" src={assetUrl(organization.emblem)} alt={organization.name} />
        ) : (
          <div className="faction-emblem-lg faction-emblem-fallback" style={{ background: accent }}>
            {organization.name.charAt(0)}
          </div>
        )}
        <div className="char-meta">
          <span className="char-meta-item">
            <span className="char-meta-label">Категория</span>
            {organization.category || '—'}
          </span>
          {organization.domain && (
            <span className="char-meta-item">
              <span className="char-meta-label">Тип</span>
              {organization.domain}
            </span>
          )}
          <span className="char-meta-item">
            <span className="char-meta-label">Состав</span>
            {members.length}
          </span>
          <span className="char-meta-item">
            <span className="char-meta-label">Зоны влияния</span>
            {zones.length}
          </span>
        </div>
      </div>

      {organization.note && (
        <section>
          <h3>О фракции</h3>
          <p className="org-note">{organization.note}</p>
        </section>
      )}

      <div className="char-clear" />

      {leaders.length > 0 && (
        <section>
          <h3>{leaders.length > 1 ? 'Главы' : 'Глава'}</h3>
          <div className="ref-list">
            {leaders.map((l) => (
              <button key={l.character.id} className="ref-chip" onClick={() => onCharacter(l.character.id)}>
                <span className="ref-chip-avatar">{l.character.name.charAt(0)}</span>
                <span className="rel-chip-body">
                  <span className="ref-chip-title">{l.character.name}</span>
                  <span className="rel-chip-kind">
                    {l.former ? 'Бывший глава' : l.character.title || 'Глава'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {members.length > 0 && (
        <section>
          <h3>Состав ({members.length})</h3>
          <div className="ref-list">
            {members.map((m) => (
              <button key={m.character.id} className="ref-chip" onClick={() => onCharacter(m.character.id)}>
                <span className="ref-chip-avatar">{m.character.name.charAt(0)}</span>
                <span className="rel-chip-body">
                  <span className="ref-chip-title">{m.character.name}</span>
                  <span className="rel-chip-kind">
                    {m.former ? 'Бывший участник' : m.character.title || ''}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {zones.length > 0 && (
        <section>
          <h3>Зоны влияния ({zones.length})</h3>
          <div className="tag-row">
            {zones.map((z) => (
              <button key={z.id} className="affil-tag affil-clickable" onClick={() => onZone(z)}>
                {z.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {groups.length > 0 && (
        <section>
          <h3>Летопись фракции</h3>
          <div className="zone-chronicle">
            {groups.map(({ era, entries }) => (
              <div
                className="chron-era"
                key={era || '__'}
                style={{ ['--ec' as string]: era ? eraTheme[era] || '#b58b4a' : '#b58b4a' }}
              >
                <div className="chron-era-head">
                  <span>{era ? shortEra(era) : 'Вне эпох'}</span>
                </div>
                {entries.map((e, i) => (
                  <div className="org-chron-entry" key={e.zoneId + i}>
                    <span className="org-chron-zone">{e.zoneName}</span>
                    <div className="chron-text">{paras(e.text)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {!organization.note &&
        leaders.length === 0 &&
        members.length === 0 &&
        zones.length === 0 &&
        groups.length === 0 && (
          <p className="modal-meta">{meta.intro || 'Об этой фракции пока ничего не записано.'}</p>
        )}
    </div>
  );
}
```

- [ ] **Step 2: Delete `src/components/OrganizationModal.tsx`**

Run: `rm src/components/OrganizationModal.tsx`

- [ ] **Step 3: Add faction-page CSS**

In `src/styles/global.css`, add right after the `/* ===== Карточка фракции (модалка организации) ===== */` block's last rule (`.org-chron-zone { ... }`):

```css
/* ===== Страница фракции (FactionPage) ===== */
.faction-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-head);
  font-size: 0.92rem;
  color: var(--titan-gold);
  background: rgba(139, 90, 38, 0.12);
  border: 1px solid #8b5a26;
  border-radius: 8px;
  padding: 8px 16px;
  margin-bottom: 18px;
  cursor: pointer;
  transition: background 0.18s ease;
}
.faction-back:hover { background: rgba(139, 90, 38, 0.24); }
.faction-emblem-lg {
  display: block;
  width: 100%;
  height: 210px;
  border-radius: 12px;
  border: 2px solid #cbb083;
  background: #1a2438;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
  object-fit: contain;
  padding: 12px;
  box-sizing: border-box;
}
.faction-emblem-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-size: 4rem;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}
```

- [ ] **Step 4: Rewire `App.tsx` — imports**

Remove:

```ts
import OrganizationModal from './components/OrganizationModal';
```

Add (near the other page imports, e.g. after `import OrganizationsPage from './components/OrganizationsPage';`):

```ts
import FactionPage from './components/FactionPage';
```

- [ ] **Step 5: Rewire `App.tsx` — replace the auto-derived members computation with resolved leaders/members**

Find:

```ts
  // данные для карточки фракции: состав, зоны влияния, летопись
  const orgMembers = useMemo(
    () =>
      activeOrg
        ? c.characters.filter((ch) => ch.affiliations.includes(activeOrg.name))
        : [],
    [activeOrg, c.characters],
  );
  const orgZones = useMemo(
```

Replace with:

```ts
  // данные для страницы фракции: главы, состав, зоны влияния, летопись
  const orgLeaders = useMemo(
    () =>
      activeOrg
        ? activeOrg.leaders
            .map((m) => (charsById[m.id] ? { character: charsById[m.id], former: m.former } : null))
            .filter((x): x is { character: Character; former?: boolean } => x !== null)
        : [],
    [activeOrg, charsById],
  );
  const orgMembers = useMemo(
    () =>
      activeOrg
        ? activeOrg.members
            .map((m) => (charsById[m.id] ? { character: charsById[m.id], former: m.former } : null))
            .filter((x): x is { character: Character; former?: boolean } => x !== null)
        : [],
    [activeOrg, charsById],
  );
  const orgZones = useMemo(
```

(The `orgZones` and `orgChronicle` blocks immediately below are unchanged — leave them exactly as they are.)

- [ ] **Step 6: Rewire `App.tsx` — stop closing the faction page when opening a member/zone from it**

Find:

```ts
  const openOrgChar = (id: string) => {
    const ch = charsById[id];
    if (!ch) return;
    setActiveOrg(null);
    setTimeout(() => setActiveCharacter(ch), 250);
  };
  const openOrgZone = (z: Zone) => {
    setActiveOrg(null);
    setTimeout(() => setActiveZone(z), 250);
  };
```

Replace with:

```ts
  const openOrgChar = (id: string) => {
    const ch = charsById[id];
    if (!ch) return;
    setActiveCharacter(ch);
  };
  const openOrgZone = (z: Zone) => {
    setActiveZone(z);
  };
```

- [ ] **Step 7: Rewire `App.tsx` — `openFaction` must switch to the Фракции tab**

Find:

```ts
  const openFaction = (name: string) => {
    const org = c.organizations.find((o) => o.name === name);
    if (org) {
      // открыть детальную карточку фракции
      setActiveCharacter(null);
      setActiveZone(null);
      setActiveEvent(null);
      setTimeout(() => setActiveOrg(org), 250);
      return;
    }
    // нет такой организации — перейти на вкладку и подсветить (старое поведение)
    closeAll();
    setFactionTarget(name);
    setPage('organizations');
  };
```

Replace with:

```ts
  const openFaction = (name: string) => {
    const org = c.organizations.find((o) => o.name === name);
    if (org) {
      // открыть полную страницу фракции
      setActiveCharacter(null);
      setActiveZone(null);
      setActiveEvent(null);
      setPage('organizations');
      setActiveOrg(org);
      return;
    }
    // нет такой организации — перейти на вкладку и подсветить (старое поведение)
    closeAll();
    setFactionTarget(name);
    setPage('organizations');
  };
```

- [ ] **Step 8: Rewire `App.tsx` — render `FactionPage` in place of the list when a faction is selected**

Find:

```tsx
        {c.status === 'ready' && page === 'organizations' && (
          <OrganizationsPage
            organizations={c.organizations}
            onSelect={openForView.organizations}
            highlight={factionTarget}
            onHighlightDone={() => setFactionTarget(undefined)}
          />
        )}
```

Replace with:

```tsx
        {c.status === 'ready' && page === 'organizations' && !activeOrg && (
          <OrganizationsPage
            organizations={c.organizations}
            onSelect={openForView.organizations}
            highlight={factionTarget}
            onHighlightDone={() => setFactionTarget(undefined)}
          />
        )}
        {c.status === 'ready' && page === 'organizations' && activeOrg && (
          <FactionPage
            organization={activeOrg}
            leaders={orgLeaders}
            members={orgMembers}
            zones={orgZones}
            chronicle={orgChronicle}
            onBack={() => setActiveOrg(null)}
            onCharacter={openOrgChar}
            onZone={openOrgZone}
          />
        )}
```

- [ ] **Step 9: Rewire `App.tsx` — remove the `OrganizationModal` overlay**

Find and delete this block entirely (in the "Просмотр" section, right after `<ZoneModal .../>`):

```tsx
      <OrganizationModal
        organization={activeOrg}
        members={orgMembers}
        zones={orgZones}
        chronicle={orgChronicle}
        onClose={() => setActiveOrg(null)}
        onCharacter={openOrgChar}
        onZone={openOrgZone}
      />
```

- [ ] **Step 10: Run the type-checker**

Run: `npx tsc -b`
Expected: PASS. If it fails on an unused import or variable, double check Step 4 removed the `OrganizationModal` import and Step 5 didn't leave the old `orgMembers` computation duplicated.

- [ ] **Step 11: Manual QA in the browser — full flow**

Run: `npm run dev`. In the browser:
1. Go to «Фракции» → click any faction card (not in edit mode). Confirm a full page replaces the list (not a modal overlay), with a «← Назад к фракциям» button, emblem/fallback on the left with a small stats box under it, and text sections on the right/below (О фракции, Главы if any, Состав if any, Зоны влияния, Летопись).
2. If the faction has zero leaders/members, confirm those sections are simply absent (no empty box).
3. Click «← Назад к фракциям» → back to the faction list.
4. Open a faction that has «Зоны влияния» entries, click one → the zone opens in its usual modal overlay on top of the faction page; close it → back on the faction page (not the faction list).
5. Using edit mode (per Task 1 QA), add a leader/member with a real character, save, reopen the faction (non-edit) and confirm it appears in the corresponding section with the right former/current label.
6. Copy the URL hash after opening a faction (`#/faction/<id>`), reload the page, confirm it reopens directly on that faction's full page.
7. Open browser devtools console — confirm no new errors/warnings appear during this flow.
8. If you added test leader/member data in edit mode purely for this QA, remove it again (or use the «↺ Сбросить черновик» button if running in local/non-cloud mode) so no fabricated lore persists.

- [ ] **Step 12: Commit**

```bash
git add src/components/FactionPage.tsx src/App.tsx src/styles/global.css
git rm src/components/OrganizationModal.tsx
git commit -m "feat(factions): replace faction modal with a full FactionPage"
```

---

## Self-Review Notes

- Spec coverage: emblem on cards (Task 3) + in-page (Task 4) ✓; full page layout mirroring the character page (Task 4) ✓; leaders with former-flag linking to characters (Tasks 1 & 4) ✓; members with former-flag linking to characters (Tasks 1 & 4) ✓; territories explicitly left untouched (no task touches `zone.factions`/`orgZones` derivation) ✓.
- All new types (`OrgMember`), component names (`FactionPage`, `MemberPickerEditor`), and prop shapes are consistent across Task 1 (definition), Task 2 (script, untyped JSON), and Task 4 (consumption) — cross-checked field names (`emblem`, `leaders`, `members`, `former`, `id`) match everywhere they're used.
- Known, accepted limitation (not a bug to fix here): if a character or zone modal is opened from within `FactionPage`, the URL hash effect in `App.tsx` will reflect `#/character/<id>` or `#/zone/<id>` instead of the underlying faction — this matches the existing behavior for event → character navigation elsewhere in the app and is out of scope to change.
