import type { Zone } from '../data/types';
import { eraOrder } from '../data';
import Modal from './Modal';
import { AllianceCrest, EraSigil, HordeCrest } from './icons';

interface Props {
  zone: Zone | null;
  onClose: () => void;
}

const paras = (text: string) =>
  text
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p, i) => <p key={i}>{p}</p>);

export default function ZoneModal({ zone, onClose }: Props) {
  const history = zone
    ? [...zone.history]
        .filter((h) => h.text.trim())
        .sort((a, b) => {
          const ia = eraOrder.indexOf(a.era);
          const ib = eraOrder.indexOf(b.era);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        })
    : [];

  return (
    <Modal open={!!zone} onClose={onClose}>
      {zone && (
        <>
          <h2>{zone.name}</h2>
          <span className="modal-subtitle">{zone.region}</span>
          <div className="modal-divider" />

          {history.length > 0 && (
            <section>
              <h3>Летопись зоны</h3>
              <div className="zone-history">
                {history.map((h, i) => (
                  <div className="zone-era" key={i}>
                    <h4 className="zone-era-title">
                      <EraSigil index={Math.max(0, eraOrder.indexOf(h.era))} size={16} />
                      {h.era}
                    </h4>
                    <div className="zone-era-body">{paras(h.text)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(zone.alliance || zone.horde) && (
            <section>
              <h3>Положение дел</h3>
              {zone.alliance && (
                <div className="faction-block alliance">
                  <h3>
                    <AllianceCrest size={20} /> Альянс
                  </h3>
                  {paras(zone.alliance)}
                </div>
              )}
              {zone.horde && (
                <div className="faction-block horde">
                  <h3>
                    <HordeCrest size={20} /> Орда
                  </h3>
                  {paras(zone.horde)}
                </div>
              )}
            </section>
          )}

          {history.length === 0 && !zone.alliance && !zone.horde && (
            <p className="modal-meta">История зоны пока не заполнена.</p>
          )}
        </>
      )}
    </Modal>
  );
}
