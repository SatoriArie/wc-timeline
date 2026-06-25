import { useMemo, useState } from 'react';
import type { Character } from '../data/types';

interface Props {
  characters: Character[];
  onSelect: (c: Character) => void;
}

export default function CharactersPage({ characters, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q),
    );
  }, [characters, query]);

  return (
    <div>
      <h1 className="page-title">Архив Персонажей</h1>
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по персонажам…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="result-count">Найдено: {filtered.length}</span>
      </div>

      {filtered.length === 0 && <p className="empty-state">Ничего не найдено.</p>}

      <div className="cards-grid">
        {filtered.map((c, i) => (
          <div
            key={c.id}
            className="character-card reveal"
            onClick={() => onSelect(c)}
            style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
          >
            <div className="character-portrait">
              {c.portrait ? (
                <img src={c.portrait} alt={c.name} />
              ) : (
                <span className="portrait-fallback">{c.name.charAt(0)}</span>
              )}
            </div>
            <div className="character-info">
              <h3>{c.name}</h3>
              <span className="character-title">{c.title}</span>
              <p className="character-brief">{stripHtml(c.biography).slice(0, 110)}…</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}
