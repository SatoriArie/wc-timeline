import type { Character, Organization, Zone } from '../data/types';
import { eraOrder, eraTheme, shortEra, categoryMeta } from '../data';
import Modal from './Modal';

interface ChronicleEntry {
  zoneId: string;
  zoneName: string;
  era: string;
  text: string;
}

interface Props {
  organization: Organization | null;
  members: Character[];
  zones: Zone[];
  chronicle: ChronicleEntry[];
  onClose: () => void;
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

export default function OrganizationModal({
  organization,
  members,
  zones,
  chronicle,
  onClose,
  onCharacter,
  onZone,
}: Props) {
  // летопись фракции: эпоха → записи (по зонам)
  const groups: { era: string; entries: ChronicleEntry[] }[] = [];
  if (organization) {
    const byEra = new Map<string, ChronicleEntry[]>();
    for (const e of chronicle) {
      if (!e.text.trim()) continue;
      if (!byEra.has(e.era)) byEra.set(e.era, []);
      byEra.get(e.era)!.push(e);
    }
    for (const [era, entries] of [...byEra.entries()].sort((a, b) => eraRank(a[0]) - eraRank(b[0]))) {
      groups.push({ era, entries });
    }
  }

  const accent = organization?.color || '#b58b4a';
  const meta = organization ? categoryMeta(organization.category) : null;

  return (
    <Modal open={!!organization} onClose={onClose}>
      {organization && (
        <div className="org-modal" style={{ ['--accent' as string]: accent }}>
          <div className="org-head">
            <span className="org-emblem" style={{ background: accent }}>
              {organization.name.charAt(0)}
            </span>
            <div>
              <h2>{organization.name}</h2>
              <span className="modal-subtitle">
                {[organization.domain, organization.category].filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>
          <div className="modal-divider" />

          {organization.note && (
            <section>
              <h3>О фракции</h3>
              <p className="org-note">{organization.note}</p>
            </section>
          )}

          {members.length > 0 && (
            <section>
              <h3>Состав ({members.length})</h3>
              <div className="ref-list">
                {members.map((m) => (
                  <button key={m.id} className="ref-chip" onClick={() => onCharacter(m.id)}>
                    <span className="ref-chip-avatar">{m.name.charAt(0)}</span>
                    <span className="rel-chip-body">
                      <span className="ref-chip-title">{m.name}</span>
                      {m.title && <span className="rel-chip-kind">{m.title}</span>}
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
            members.length === 0 &&
            zones.length === 0 &&
            groups.length === 0 && (
              <p className="modal-meta">
                {meta?.intro || 'Об этой фракции пока ничего не записано.'}
              </p>
            )}
        </div>
      )}
    </Modal>
  );
}
