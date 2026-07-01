import { useMemo, useState } from 'react';
import type { Character, TimelineEvent } from '../data/types';
import { eraOrder } from '../data';
import { EraSigil } from './icons';

interface Props {
  events: TimelineEvent[];
  characters: Character[];
  onNavigate: (tab: 'map' | 'events' | 'characters' | 'cosmology' | 'pantheons') => void;
  onOpenEvent: (e: TimelineEvent) => void;
}

const shortEra = (era: string) => era.split('.')[0].trim();

export default function HomePage({ events, characters, onNavigate, onOpenEvent }: Props) {
  const portals = [
    { id: 'map' as const, sigil: 4, title: 'Карта Азерота', desc: 'Интерактивная карта и хроники земель' },
    { id: 'events' as const, sigil: 1, title: 'Хроники Событий', desc: `${events.length} событий через ${eraOrder.length} эпох` },
    { id: 'characters' as const, sigil: 3, title: 'Архив Персонажей', desc: `${characters.length} героев и злодеев Азерота` },
    { id: 'cosmology' as const, sigil: 0, title: 'Космология', desc: 'Шесть сил мироздания' },
    { id: 'pantheons' as const, sigil: 2, title: 'Пантеоны', desc: 'Титаны, Аспекты, Древние Боги' },
  ];

  const withText = useMemo(() => events.filter((e) => e.description.trim().length > 60), [events]);
  const [spotIdx, setSpotIdx] = useState(() => Math.floor(Math.random() * 1e9));
  const spotlight = withText.length ? withText[spotIdx % withText.length] : null;

  return (
    <div className="home">
      <p className="home-lead">
        Добро пожаловать в летопись Азерота. Здесь сплетены события, судьбы героев, земли и сами силы
        мироздания — от Сотворения Миров до наших дней. Выбери, с чего начать путь.
      </p>

      <div className="portal-grid">
        {portals.map((p) => (
          <button className="portal" key={p.id} onClick={() => onNavigate(p.id)}>
            <span className="portal-sigil">
              <EraSigil index={p.sigil} size={40} />
            </span>
            <span className="portal-title">{p.title}</span>
            <span className="portal-desc">{p.desc}</span>
          </button>
        ))}
      </div>

      {spotlight && (
        <div className="spotlight home-spotlight">
          <div className="spotlight-eyebrow">
            <EraSigil index={Math.max(0, eraOrder.indexOf(spotlight.era))} size={18} /> Из хроник
          </div>
          <h2 className="spotlight-title">{spotlight.title}</h2>
          <span className="spotlight-year">
            {spotlight.period || '—'} · {shortEra(spotlight.era)}
          </span>
          <p className="spotlight-text">{spotlight.description}</p>
          <div className="spotlight-actions">
            <button className="icon-btn active" onClick={() => onOpenEvent(spotlight)}>
              Открыть свиток
            </button>
            <button
              className="icon-btn"
              onClick={() => setSpotIdx((i) => i + 1 + Math.floor(Math.random() * 7))}
            >
              ↻ Другое
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
