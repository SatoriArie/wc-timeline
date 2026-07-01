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

      <div className="faction-parchment">
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
    </div>
  );
}
