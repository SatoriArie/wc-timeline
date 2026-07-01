import type { Zone, ZoneChronicle } from '../data/types';
import { eraOrder, eraTheme, shortEra } from '../data';
import { zoneThumb } from '../data/zoneThumbs';
import { assetUrl } from '../utils/asset';
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

const factionClass = (f: string) => (f === 'Альянс' ? 'alliance' : f === 'Орда' ? 'horde' : 'neutral');
const factionCrest = (f: string) =>
  f === 'Альянс' ? <AllianceCrest size={13} /> : f === 'Орда' ? <HordeCrest size={13} /> : null;

/** Порядок эпох: «общее» (пусто) → канон-порядок → неизвестные. */
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
              {factionCrest(v)}
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
  // летопись: эпоха → { общий обзор, блоки по фракциям }
  const groups: {
    era: string;
    general: ZoneChronicle[];
    factions: [string, ZoneChronicle[]][];
  }[] = [];
  if (zone) {
    const byEra = new Map<string, ZoneChronicle[]>();
    for (const c of zone.chronicle) {
      if (!c.text.trim()) continue;
      if (!byEra.has(c.era)) byEra.set(c.era, []);
      byEra.get(c.era)!.push(c);
    }
    for (const [era, entries] of [...byEra.entries()].sort((a, b) => eraRank(a[0]) - eraRank(b[0]))) {
      const general = entries.filter((e) => !e.faction.trim());
      const facMap = new Map<string, ZoneChronicle[]>();
      for (const e of entries) {
        if (!e.faction.trim()) continue;
        if (!facMap.has(e.faction)) facMap.set(e.faction, []);
        facMap.get(e.faction)!.push(e);
      }
      groups.push({ era, general, factions: [...facMap.entries()] });
    }
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
          {(() => {
            const img = zoneThumb(zone.name) ?? (zone.images[0] ? assetUrl(zone.images[0]) : null);
            return img ? (
              <div className="zone-hero" style={{ backgroundImage: `url(${img})` }}>
                <div className="zone-hero-cap">
                  <h2>{zone.name}</h2>
                  <span className="modal-subtitle">{zone.region}</span>
                </div>
              </div>
            ) : (
              <>
                <h2>{zone.name}</h2>
                <span className="modal-subtitle">{zone.region}</span>
                <div className="modal-divider" />
              </>
            );
          })()}

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
                {groups.map(({ era, general, factions }) => (
                  <div
                    className="chron-era"
                    key={era || '__'}
                    style={{ ['--ec' as string]: era ? eraTheme[era] || '#b58b4a' : '#b58b4a' }}
                  >
                    <div className="chron-era-head">
                      {era ? <EraSigil index={Math.max(0, eraOrder.indexOf(era))} size={16} /> : null}
                      <span>{era ? shortEra(era) : 'Общее положение'}</span>
                    </div>

                    {general.length > 0 && (
                      <div className="chron-overview">{general.map((c) => paras(c.text))}</div>
                    )}

                    {factions.map(([fac, entries]) => (
                      <div className={`chron-faction-block ${factionClass(fac)}`} key={fac}>
                        <button
                          className={`faction-tag ${factionClass(fac)} faction-tag-btn`}
                          onClick={() => onFaction(fac)}
                        >
                          {factionCrest(fac)}
                          {fac}
                        </button>
                        <div className="chron-text">{entries.map((c) => paras(c.text))}</div>
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
