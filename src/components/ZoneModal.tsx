import type { Zone, ZoneChronicle } from '../data/types';
import { eraOrder, eraTheme, shortEra } from '../data';
import Modal from './Modal';
import { AllianceCrest, EraSigil, HordeCrest } from './icons';

interface Props {
  zone: Zone | null;
  onClose: () => void;
  onFaction: (name: string) => void;
}

const paras = (text: string) =>
  text
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p, i) => <p key={i}>{p}</p>);

/** Порядок эпох в летописи: «общее» (пусто) → канон-порядок → неизвестные. */
function eraRank(era: string): number {
  if (!era) return -1;
  const i = eraOrder.indexOf(era);
  return i === -1 ? 9999 : i;
}

function InfoRow({
  label,
  items,
  onItem,
}: {
  label: string;
  items: string[];
  onItem?: (v: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <div className="info-vals">
        {items.map((v) =>
          onItem ? (
            <button key={v} className="info-chip info-chip-btn" onClick={() => onItem(v)}>
              {v === 'Альянс' && <AllianceCrest size={13} />}
              {v === 'Орда' && <HordeCrest size={13} />}
              {v}
            </button>
          ) : (
            <span key={v} className="info-chip">
              {v}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

export default function ZoneModal({ zone, onClose, onFaction }: Props) {
  // группировка летописи по эпохам
  const groups: { era: string; entries: ZoneChronicle[] }[] = [];
  if (zone) {
    const map = new Map<string, ZoneChronicle[]>();
    for (const c of zone.chronicle) {
      if (!c.text.trim()) continue;
      if (!map.has(c.era)) map.set(c.era, []);
      map.get(c.era)!.push(c);
    }
    groups.push(
      ...[...map.entries()]
        .map(([era, entries]) => ({ era, entries }))
        .sort((a, b) => eraRank(a.era) - eraRank(b.era)),
    );
  }

  const hasInfo =
    zone &&
    (zone.inhabitants.length ||
      zone.rulers.length ||
      zone.settlementsMajor.length ||
      zone.settlementsMinor.length ||
      zone.factions.length ||
      zone.region);

  return (
    <Modal open={!!zone} onClose={onClose}>
      {zone && (
        <>
          <h2>{zone.name}</h2>
          <span className="modal-subtitle">{zone.region}</span>
          <div className="modal-divider" />

          {hasInfo && (
            <section>
              <h3>Основные сведения</h3>
              <div className="zone-info">
                <InfoRow label="Обитатели" items={zone.inhabitants} />
                <InfoRow label="Правители" items={zone.rulers} />
                <InfoRow label="Крупные поселения" items={zone.settlementsMajor} />
                <InfoRow label="Малые поселения" items={zone.settlementsMinor} />
                <InfoRow label="Принадлежность" items={zone.factions} onItem={onFaction} />
                {zone.region && <InfoRow label="Регион" items={[zone.region]} />}
              </div>
            </section>
          )}

          {groups.length > 0 && (
            <section>
              <h3>Летопись зоны</h3>
              <div className="zone-chronicle">
                {groups.map(({ era, entries }) => (
                  <div
                    className="chron-era"
                    key={era || '__'}
                    style={{ ['--ec' as string]: era ? eraTheme[era] || '#b58b4a' : '#b58b4a' }}
                  >
                    <div className="chron-era-head">
                      {era ? <EraSigil index={Math.max(0, eraOrder.indexOf(era))} size={16} /> : null}
                      <span>{era ? shortEra(era) : 'Общее положение'}</span>
                    </div>
                    {entries.map((c, i) => (
                      <div className="chron-entry" key={i}>
                        {c.faction && (
                          <button
                            className={`faction-tag ${c.faction === 'Альянс' ? 'alliance' : c.faction === 'Орда' ? 'horde' : 'neutral'} chron-faction faction-tag-btn`}
                            onClick={() => onFaction(c.faction)}
                          >
                            {c.faction === 'Альянс' && <AllianceCrest size={13} />}
                            {c.faction === 'Орда' && <HordeCrest size={13} />}
                            {c.faction}
                          </button>
                        )}
                        <div className="chron-text">{paras(c.text)}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!hasInfo && groups.length === 0 && (
            <p className="modal-meta">История зоны пока не заполнена.</p>
          )}
        </>
      )}
    </Modal>
  );
}
