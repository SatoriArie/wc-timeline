import type { Character, TimelineEvent } from '../data/types';
import Modal from './Modal';
import { renderDescription } from '../utils/linkify';
import { SOURCE_LABEL, SourceIcon } from './icons';
import { assetUrl } from '../utils/asset';

interface Props {
  event: TimelineEvent | null;
  characters: Character[];
  relatedCharacters: Character[];
  onClose: () => void;
  onCharacter: (id: string) => void;
}

export default function EventModal({
  event,
  characters,
  relatedCharacters,
  onClose,
  onCharacter,
}: Props) {
  return (
    <Modal open={!!event} onClose={onClose}>
      {event && (
        <>
          <h2>{event.title}</h2>
          <span className="modal-subtitle">
            {event.period || 'Период неизвестен'}
            {event.era ? ` · ${event.era}` : ''}
          </span>
          <div className="modal-divider" />

          <section>
            <h3>Описание</h3>
            {event.description ? (
              renderDescription(event.description, characters, onCharacter)
            ) : (
              <p className="modal-meta">Описание пока не заполнено.</p>
            )}
          </section>

          {relatedCharacters.length > 0 && (
            <section>
              <h3>Действующие лица</h3>
              <div className="ref-list">
                {relatedCharacters.map((c) => (
                  <button key={c.id} className="ref-chip" onClick={() => onCharacter(c.id)}>
                    <span className="ref-chip-avatar">{c.name.charAt(0)}</span>
                    <span className="ref-chip-title">{c.name}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {event.images.length > 0 && (
            <section>
              <h3>Изображения</h3>
              <div className="cards-grid">
                {event.images.map((src, i) => (
                  <img key={i} src={assetUrl(src)} alt={event.title} style={{ width: '100%', borderRadius: 8 }} />
                ))}
              </div>
            </section>
          )}

          {event.sources.length > 0 && (
            <section>
              <h3>Источники</h3>
              <ul className="source-list">
                {event.sources.map((s, i) => (
                  <li
                    key={i}
                    className={`source-item source-${s.type}`}
                    title={SOURCE_LABEL[s.type]}
                  >
                    <SourceIcon type={s.type} className="src-ico" />
                    {s.text}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </Modal>
  );
}
