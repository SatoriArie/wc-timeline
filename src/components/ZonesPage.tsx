import { useMemo, useState } from 'react';
import type { Zone } from '../data/types';
import { regionOrder } from '../data';
import { AllianceCrest, EraSigil, HordeCrest } from './icons';

interface Props {
  zones: Zone[];
  onSelect: (z: Zone) => void;
  initialRegion?: string;
}

export default function ZonesPage({ zones, onSelect, initialRegion }: Props) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState(initialRegion ?? 'all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return zones.filter((z) => {
      if (region !== 'all' && z.region !== region) return false;
      if (!q) return true;
      return (
        z.name.toLowerCase().includes(q) ||
        z.factions.some((f) => f.toLowerCase().includes(q)) ||
        z.chronicle.some((c) => c.text.toLowerCase().includes(q))
      );
    });
  }, [zones, query, region]);

  const groups = useMemo(() => {
    const map = new Map<string, Zone[]>();
    for (const z of filtered) {
      const key = z.region || 'Прочее';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(z);
    }
    const order = [...regionOrder, 'Прочее'];
    return [...map.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, [filtered]);

  return (
    <div>
      <h1 className="page-title">Хроники Зон</h1>
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по зонам…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="filter-select" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">Все регионы</option>
          {regionOrder.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <span className="result-count">Найдено: {filtered.length}</span>
      </div>

      {groups.length === 0 && <p className="empty-state">Ничего не найдено.</p>}

      {groups.map(([regionName, list], gi) => (
        <div className="era-group" key={regionName}>
          <h2 className="era-heading">
            <EraSigil index={gi} className="era-sigil" />
            {regionName}
          </h2>
          <div className="cards-grid">
            {list.map((z, i) => (
              <div
                key={z.id}
                className="zone-card reveal"
                onClick={() => onSelect(z)}
                style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
              >
                <h3>{z.name}</h3>
                <span className="zone-region">{z.region}</span>
                {z.factions.length > 0 && (
                  <div className="faction-tags">
                    {z.factions.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className={`faction-tag ${f === 'Альянс' ? 'alliance' : f === 'Орда' ? 'horde' : 'neutral'}`}
                      >
                        {f === 'Альянс' && <AllianceCrest size={14} />}
                        {f === 'Орда' && <HordeCrest size={14} />}
                        {f}
                      </span>
                    ))}
                    {z.factions.length > 4 && (
                      <span className="faction-tag neutral">+{z.factions.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
