import { useEffect, useState } from 'react';
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
import { assetUrl } from '../utils/asset';
import {
  eraOrder,
  regionOrder,
  orgCategoryOrder,
  genderOptions,
  classOptions,
  raceOptions,
  classIcon,
  findClass,
} from '../data';
import Modal from './Modal';
import { SOURCE_LABEL, SourceIcon } from './icons';

const SOURCE_TYPES: SourceType[] = ['book', 'game', 'quest', 'dungeon'];
const RELATION_KINDS: { id: RelationKind; label: string }[] = [
  { id: 'ally', label: 'Союзник' },
  { id: 'enemy', label: 'Враг' },
  { id: 'kin', label: 'Родство' },
];

type Entity = TimelineEvent | Character | Zone | Organization;

interface Props {
  type: PageId;
  item: Entity | null; // null => создание
  open: boolean;
  allCharacters: Character[];
  allFactions: string[];
  onClose: () => void;
  onSave: (item: Entity) => void;
  onDelete?: (id: string) => void;
}

const lines = (arr: string[] | undefined) => (arr ?? []).join('\n');
const toLines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') ||
  `item-${Date.now()}`;

export default function EditModal({
  type,
  item,
  open,
  allCharacters,
  allFactions,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [sources, setSources] = useState<SourceRef[]>([]);
  const [zoneChronicle, setZoneChronicle] = useState<ZoneChronicle[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [orgLeaders, setOrgLeaders] = useState<OrgMember[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);

  useEffect(() => {
    if (!open) return;
    if (type === 'events') {
      const e = item as TimelineEvent | null;
      setForm({
        title: e?.title ?? '',
        period: e?.period ?? '',
        era: e?.era ?? '',
        description: e?.description ?? '',
        images: lines(e?.images),
      });
      // по умолчанию — одна пустая строка источника с выбором типа
      setSources(e?.sources?.length ? e.sources.map((s) => ({ ...s })) : [{ text: '', type: 'book' }]);
    } else if (type === 'characters') {
      const c = item as Character | null;
      setForm({
        name: c?.name ?? '',
        title: c?.title ?? '',
        portrait: c?.portrait ?? '',
        gender: c?.gender ?? '',
        race: c?.race ?? '',
        raceTransform: c?.raceTransform ?? '',
        // приводим класс к каноничному имени (терпит регистр/слаг), чтобы дропдаун отобразил его
        class: findClass(c?.class)?.name ?? c?.class ?? '',
        status: c?.status ?? '',
        affiliations: lines(c?.affiliations),
        biography: c?.biography ?? '',
        role: c?.role ?? '',
        games: lines(c?.games),
        books: lines(c?.books),
      });
      setRelations(c?.relations?.length ? c.relations.map((r) => ({ ...r })) : []);
    } else if (type === 'zones') {
      const z = item as Zone | null;
      setForm({
        name: z?.name ?? '',
        region: z?.region ?? '',
        factions: lines(z?.factions),
        inhabitants: lines(z?.inhabitants),
        rulers: lines(z?.rulers),
        settlementsMajor: lines(z?.settlementsMajor),
        settlementsMinor: lines(z?.settlementsMinor),
        images: lines(z?.images),
      });
      setZoneChronicle(z?.chronicle?.length ? z.chronicle.map((c) => ({ ...c })) : []);
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
  }, [open, item, type]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    let result: Entity;
    if (type === 'events') {
      const period = form.period || '';
      const nums = period.replace('−', '-').match(/-?\d[\d ]*/);
      result = {
        id: (item as TimelineEvent)?.id ?? slug(form.title),
        title: form.title,
        period,
        sortYear: nums ? parseInt(nums[0].replace(/ /g, ''), 10) : 999999,
        era: form.era,
        description: form.description,
        sources: sources
          .filter((s) => s.text.trim())
          .map((s) => ({ text: s.text.trim(), type: s.type })),
        images: toLines(form.images),
      } satisfies TimelineEvent;
    } else if (type === 'characters') {
      result = {
        id: (item as Character)?.id ?? slug(form.name),
        name: form.name,
        title: form.title,
        portrait: form.portrait,
        gender: form.gender,
        race: form.race,
        raceTransform: form.raceTransform,
        class: form.class,
        status: form.status,
        affiliations: toLines(form.affiliations),
        biography: form.biography.startsWith('<') ? form.biography : `<p>${form.biography}</p>`,
        role: form.role,
        games: toLines(form.games),
        books: toLines(form.books),
        relations: relations
          .filter((r) => r.id)
          .map((r) => ({ id: r.id, kind: r.kind, ...(r.note ? { note: r.note } : {}) })),
      } satisfies Character;
    } else if (type === 'zones') {
      result = {
        id: (item as Zone)?.id ?? slug(form.name),
        name: form.name,
        region: form.region,
        factions: toLines(form.factions),
        inhabitants: toLines(form.inhabitants),
        rulers: toLines(form.rulers),
        settlementsMajor: toLines(form.settlementsMajor),
        settlementsMinor: toLines(form.settlementsMinor),
        chronicle: zoneChronicle
          .filter((c) => c.text.trim())
          .map((c) => ({ faction: c.faction.trim(), era: c.era.trim(), text: c.text })),
        images: toLines(form.images),
      } satisfies Zone;
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
    onSave(result);
    onClose();
  };

  const label =
    type === 'events'
      ? 'событие'
      : type === 'characters'
        ? 'персонажа'
        : type === 'zones'
          ? 'зону'
          : 'фракцию';

  return (
    <Modal open={open} onClose={onClose}>
      <h2>{item ? 'Редактировать' : 'Добавить'} {label}</h2>
      <div className="modal-divider" />
      <div className="edit-form">
        {type === 'events' && (
          <>
            <Field label="Название" value={form.title} onChange={(v) => set('title', v)} />
            <Field label="Период (напр. -25000)" value={form.period} onChange={(v) => set('period', v)} />
            <Field label="Эпоха" value={form.era} onChange={(v) => set('era', v)} list="eras" />
            <Area label="Описание" value={form.description} onChange={(v) => set('description', v)} rows={6} />
            <SourcesEditor sources={sources} onChange={setSources} />
            <Area label="Изображения (URL по строке)" value={form.images} onChange={(v) => set('images', v)} />
          </>
        )}
        {type === 'characters' && (
          <>
            <Field label="Имя" value={form.name} onChange={(v) => set('name', v)} />
            <Field label="Титул" value={form.title} onChange={(v) => set('title', v)} />
            <SelectField
              label="Пол"
              value={form.gender}
              onChange={(v) => set('gender', v)}
              options={genderOptions.map((g) => ({ value: g, label: g }))}
            />
            <div className="form-grid-2">
              <Field label="Раса" value={form.race} onChange={(v) => set('race', v)} list="races" />
              <Field
                label="Стал(а) — трансформация"
                value={form.raceTransform}
                onChange={(v) => set('raceTransform', v)}
                list="races"
              />
            </div>
            <ClassField value={form.class} onChange={(v) => set('class', v)} />
            <Field label="Статус (Жив / Погиб / Нежить…)" value={form.status} onChange={(v) => set('status', v)} />
            <Field label="Портрет (URL)" value={form.portrait} onChange={(v) => set('portrait', v)} />
            <Area label="Биография" value={form.biography} onChange={(v) => set('biography', v)} rows={6} />
            <RelationsEditor
              relations={relations}
              onChange={setRelations}
              characters={allCharacters}
              selfId={(item as Character | null)?.id}
            />
            <Area label="Принадлежность (по строке)" value={form.affiliations} onChange={(v) => set('affiliations', v)} />
            <Area label="Игры (по строке)" value={form.games} onChange={(v) => set('games', v)} />
            <Area label="Книги (по строке)" value={form.books} onChange={(v) => set('books', v)} />
          </>
        )}
        {type === 'zones' && (
          <>
            <Field label="Название" value={form.name} onChange={(v) => set('name', v)} />
            <Field label="Регион" value={form.region} onChange={(v) => set('region', v)} list="regions" />
            <Area label="Принадлежность — фракции (по строке)" value={form.factions} onChange={(v) => set('factions', v)} />
            <Area label="Обитатели (по строке)" value={form.inhabitants} onChange={(v) => set('inhabitants', v)} />
            <Area label="Правители (по строке)" value={form.rulers} onChange={(v) => set('rulers', v)} />
            <Area label="Крупные поселения (по строке)" value={form.settlementsMajor} onChange={(v) => set('settlementsMajor', v)} />
            <Area label="Малые поселения (по строке)" value={form.settlementsMinor} onChange={(v) => set('settlementsMinor', v)} />
            <ZoneChronicleEditor chronicle={zoneChronicle} onChange={setZoneChronicle} />
          </>
        )}
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

        <datalist id="eras">
          {eraOrder.map((e) => (
            <option key={e} value={e} />
          ))}
        </datalist>
        <datalist id="regions">
          {regionOrder.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
        <datalist id="factions">
          {allFactions.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
        <datalist id="orgcats">
          {orgCategoryOrder.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
        <datalist id="races">
          {raceOptions.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>

        <div className="form-actions">
          <button className="form-btn form-btn-save" onClick={handleSave}>
            <span className="form-btn-ico">✓</span> Сохранить
          </button>
          <button className="form-btn form-btn-cancel" onClick={onClose}>
            Отмена
          </button>
          {item && onDelete && (
            <button
              className="form-btn form-btn-delete"
              onClick={() => {
                onDelete((item as { id: string }).id);
                onClose();
              }}
            >
              <span className="form-btn-ico">🗑</span> Удалить
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  list,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  list?: string;
}) {
  return (
    <label className="form-row">
      <span>{label}</span>
      <input value={value ?? ''} list={list} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="form-row">
      <span>{label}</span>
      <select className="form-select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ClassField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const icon = classIcon(value);
  return (
    <label className="form-row">
      <span>Класс</span>
      <div className="class-select-row">
        {icon ? (
          <img className="class-select-ico" src={icon} alt="" />
        ) : (
          <span className="class-select-ico class-select-ico-empty" />
        )}
        <select
          className="form-select class-select"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {classOptions.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="form-row">
      <span>{label}</span>
      <textarea value={value ?? ''} rows={rows} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function SourcesEditor({
  sources,
  onChange,
}: {
  sources: SourceRef[];
  onChange: (s: SourceRef[]) => void;
}) {
  const update = (i: number, patch: Partial<SourceRef>) =>
    onChange(sources.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => onChange(sources.filter((_, idx) => idx !== i));
  const add = () => onChange([...sources, { text: '', type: 'book' }]);

  return (
    <div className="form-row">
      <span>Источники</span>
      <div className="source-editor">
        {sources.map((s, i) => (
          <div className="source-row" key={i}>
            <SourceIcon type={s.type} className={`src-ico source-${s.type}`} size={18} />
            <input
              className="source-text"
              placeholder="Название источника"
              value={s.text}
              onChange={(e) => update(i, { text: e.target.value })}
            />
            <select
              className="source-type"
              value={s.type}
              onChange={(e) => update(i, { type: e.target.value as SourceType })}
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SOURCE_LABEL[t]}
                </option>
              ))}
            </select>
            <button type="button" className="source-del" onClick={() => remove(i)} title="Удалить">
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="source-add" onClick={add}>
          + Добавить источник
        </button>
      </div>
    </div>
  );
}

function RelationsEditor({
  relations,
  onChange,
  characters,
  selfId,
}: {
  relations: Relation[];
  onChange: (r: Relation[]) => void;
  characters: Character[];
  selfId?: string;
}) {
  const options = characters.filter((c) => c.id !== selfId);
  const update = (i: number, patch: Partial<Relation>) =>
    onChange(relations.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => onChange(relations.filter((_, idx) => idx !== i));
  const add = () => onChange([...relations, { id: options[0]?.id ?? '', kind: 'ally' }]);

  return (
    <div className="form-row">
      <span>Связи с персонажами</span>
      <div className="source-editor">
        {relations.map((r, i) => (
          <div className="rel-row" key={i}>
            <select
              className="source-type rel-row-char"
              value={r.id}
              onChange={(e) => update(i, { id: e.target.value })}
            >
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="source-type"
              value={r.kind}
              onChange={(e) => update(i, { kind: e.target.value as RelationKind })}
            >
              {RELATION_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
            <input
              className="source-text"
              placeholder="Заметка (необяз.)"
              value={r.note ?? ''}
              onChange={(e) => update(i, { note: e.target.value })}
            />
            <button type="button" className="source-del" onClick={() => remove(i)} title="Удалить">
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="source-add" onClick={add}>
          + Добавить связь
        </button>
      </div>
    </div>
  );
}

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

function ZoneChronicleEditor({
  chronicle,
  onChange,
}: {
  chronicle: ZoneChronicle[];
  onChange: (c: ZoneChronicle[]) => void;
}) {
  const update = (i: number, patch: Partial<ZoneChronicle>) =>
    onChange(chronicle.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const remove = (i: number) => onChange(chronicle.filter((_, idx) => idx !== i));
  const add = () => onChange([...chronicle, { faction: '', era: '', text: '' }]);

  return (
    <div className="form-row">
      <span>Летопись (фракция × эпоха)</span>
      <div className="zone-hist-editor">
        {chronicle.map((c, i) => (
          <div className="zone-hist-row" key={i}>
            <div className="zone-hist-head">
              <input
                className="zone-hist-era"
                list="factions"
                placeholder="Фракция (из списка; пусто = общее)"
                value={c.faction}
                onChange={(e) => update(i, { faction: e.target.value })}
              />
              <input
                className="zone-hist-era"
                list="eras"
                placeholder="Эпоха (пусто = вне эпох)"
                value={c.era}
                onChange={(e) => update(i, { era: e.target.value })}
              />
              <button
                type="button"
                className="source-del"
                onClick={() => remove(i)}
                title="Удалить запись"
              >
                ✕
              </button>
            </div>
            <textarea
              className="zone-hist-text"
              rows={3}
              placeholder="Что происходило в зоне (для этой фракции/эпохи)…"
              value={c.text}
              onChange={(e) => update(i, { text: e.target.value })}
            />
          </div>
        ))}
        <button type="button" className="source-add" onClick={add}>
          + Добавить запись
        </button>
      </div>
    </div>
  );
}
