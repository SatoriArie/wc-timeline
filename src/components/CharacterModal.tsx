import type { Character, RelationKind, TimelineEvent } from '../data/types';
import Modal from './Modal';
import { assetUrl } from '../utils/asset';

interface RelationView {
  character: Character;
  kind: RelationKind;
  note?: string;
}

interface Props {
  character: Character | null;
  relatedEvents: TimelineEvent[];
  relations: RelationView[];
  onClose: () => void;
  onEvent: (e: TimelineEvent) => void;
  onCharacter: (id: string) => void;
}

const KIND_LABEL: Record<RelationKind, string> = {
  ally: 'Союзник',
  enemy: 'Враг',
  kin: 'Родство',
};

export default function CharacterModal({
  character,
  relatedEvents,
  relations,
  onClose,
  onEvent,
  onCharacter,
}: Props) {
  return (
    <Modal open={!!character} onClose={onClose}>
      {character && (
        <>
          <h2>{character.name}</h2>
          <span className="modal-subtitle">{character.title}</span>
          <div className="modal-divider" />

          {character.portrait ? (
            <img className="modal-portrait" src={assetUrl(character.portrait)} alt={character.name} />
          ) : null}

          <section>
            <h3>Биография</h3>
            <div dangerouslySetInnerHTML={{ __html: character.biography }} />
          </section>

          {character.role && (
            <section>
              <h3>Роль</h3>
              <p className="modal-meta">{character.role}</p>
            </section>
          )}

          {relations.length > 0 && (
            <section>
              <h3>Связи</h3>
              <div className="ref-list">
                {relations.map((r) => (
                  <button
                    key={r.character.id}
                    className={`rel-chip rel-${r.kind}`}
                    onClick={() => onCharacter(r.character.id)}
                    title={r.note || KIND_LABEL[r.kind]}
                  >
                    <span className="ref-chip-avatar">{r.character.name.charAt(0)}</span>
                    <span className="rel-chip-body">
                      <span className="ref-chip-title">{r.character.name}</span>
                      <span className="rel-chip-kind">{r.note || KIND_LABEL[r.kind]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {relatedEvents.length > 0 && (
            <section>
              <h3>Упоминается в хрониках</h3>
              <div className="ref-list">
                {relatedEvents.map((e) => (
                  <button key={e.id} className="ref-chip" onClick={() => onEvent(e)}>
                    <span className="ref-chip-title">{e.title}</span>
                    <span className="ref-chip-year">{e.period || '—'}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {character.games.length > 0 && (
            <section>
              <h3>Появления в играх</h3>
              <div className="tag-row">
                {character.games.map((g, i) => (
                  <span key={i} className="game-tag">
                    {g}
                  </span>
                ))}
              </div>
            </section>
          )}

          {character.books.length > 0 && (
            <section>
              <h3>Книги</h3>
              <div className="tag-row">
                {character.books.map((b, i) => (
                  <span key={i} className="game-tag">
                    {b}
                  </span>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </Modal>
  );
}
