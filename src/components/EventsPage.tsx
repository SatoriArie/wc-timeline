import { useEffect, useMemo, useState } from 'react';
import type { TimelineEvent } from '../data/types';
import { eraOrder } from '../data';
import { eraForce, forceColor, forceLabel } from '../data/cosmology';
import { EraSigil } from './icons';

interface Props {
  events: TimelineEvent[];
  onSelect: (e: TimelineEvent) => void;
}

/** Короткое имя эпохи для навигации (до первой точки). */
const shortEra = (era: string) => era.split('.')[0].trim();

export default function EventsPage({ events, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [era, setEra] = useState('all');
  const [activeEra, setActiveEra] = useState<string>('');

  const browsing = query.trim() === '' && era === 'all';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (era !== 'all' && e.era !== era) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.period.toLowerCase().includes(q)
      );
    });
  }, [events, query, era]);

  // группировка по эпохам в хронологическом порядке
  const groups = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const e of filtered) {
      const key = e.era || 'Прочее';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    const order = [...eraOrder, 'Прочее'];
    return [...map.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, [filtered]);

  // случайное событие для спотлайта «Из хроник»
  const withText = useMemo(() => events.filter((e) => e.description.trim().length > 60), [events]);
  const [spotIdx, setSpotIdx] = useState(() => Math.floor(Math.random() * 1e9));
  const spotlight = withText.length ? withText[spotIdx % withText.length] : null;

  // скролл-подсветка активной эпохи
  useEffect(() => {
    if (!browsing) return;
    const headings = Array.from(document.querySelectorAll<HTMLElement>('[data-era]'));
    if (!headings.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveEra(visible[0].target.getAttribute('data-era') || '');
      },
      { rootMargin: '-120px 0px -65% 0px', threshold: 0 },
    );
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [browsing, groups]);

  const scrollToEra = (eraName: string) => {
    const el = document.querySelector(`[data-era="${CSS.escape(eraName)}"]`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {browsing && spotlight && (
        <div className="spotlight">
          <div className="spotlight-eyebrow">
            <EraSigil index={Math.max(0, eraOrder.indexOf(spotlight.era))} size={18} /> Из хроник
          </div>
          <h2 className="spotlight-title">{spotlight.title}</h2>
          <span className="spotlight-year">
            {spotlight.period || '—'} · {shortEra(spotlight.era)}
          </span>
          <p className="spotlight-text">{spotlight.description}</p>
          <div className="spotlight-actions">
            <button className="icon-btn active" onClick={() => onSelect(spotlight)}>
              Открыть свиток
            </button>
            <button className="icon-btn" onClick={() => setSpotIdx((i) => i + 1 + Math.floor(Math.random() * 7))}>
              ↻ Другое
            </button>
          </div>
        </div>
      )}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по событиям…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="filter-select" value={era} onChange={(e) => setEra(e.target.value)}>
          <option value="all">Все эпохи</option>
          {eraOrder.map((er) => (
            <option key={er} value={er}>
              {er}
            </option>
          ))}
        </select>
        <span className="result-count">Найдено: {filtered.length}</span>
      </div>

      {browsing && groups.length > 1 && (
        <nav className="era-nav" aria-label="Навигация по эпохам">
          {groups.map(([eraName, list]) => (
            <button
              key={eraName}
              className={`era-chip ${activeEra === eraName ? 'active' : ''}`}
              onClick={() => scrollToEra(eraName)}
              title={eraName}
            >
              {shortEra(eraName)}
              <span className="era-chip-count">{list.length}</span>
            </button>
          ))}
        </nav>
      )}

      {groups.length === 0 && <p className="empty-state">Ничего не найдено.</p>}

      {groups.map(([eraName, list]) => {
        const force = eraForce[eraName];
        return (
        <div
          className="era-group"
          key={eraName}
          style={force ? ({ ['--era-force' as string]: forceColor[force] }) : undefined}
        >
          <h2 className="era-heading" data-era={eraName}>
            <EraSigil index={Math.max(0, eraOrder.indexOf(eraName))} className="era-sigil" />
            {eraName}
            {force && <span className="era-force-badge">{forceLabel[force]}</span>}
          </h2>
          <div className="timeline">
            <div className="timeline-line" />
            {list.map((e, i) => (
              <div
                key={e.id}
                className={`timeline-event ${i % 2 === 0 ? 'left' : 'right'} reveal`}
                style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
              >
                <div className="event-card" onClick={() => onSelect(e)}>
                  <h3>{e.title}</h3>
                  <span className="event-year">{e.period || '—'}</span>
                  {e.description && <p className="event-snippet">{e.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
}
