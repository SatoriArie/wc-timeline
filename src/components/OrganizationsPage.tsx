import { useEffect, useMemo } from 'react';
import type { Organization } from '../data/types';
import { categoryMeta, orgCategoryOrder } from '../data';
import { assetUrl } from '../utils/asset';

interface Props {
  organizations: Organization[];
  onSelect: (o: Organization) => void;
  highlight?: string;
  onHighlightDone?: () => void;
}

export default function OrganizationsPage({
  organizations,
  onSelect,
  highlight,
  onHighlightDone,
}: Props) {
  // группировка по категориям в каноническом порядке
  const groups = useMemo(() => {
    const map = new Map<string, Organization[]>();
    for (const o of organizations) {
      const key = o.category || 'Прочее';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    const order = [...orgCategoryOrder, 'Прочее'];
    return [...map.entries()].sort((a, b) => {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }, [organizations]);

  useEffect(() => {
    if (!highlight) return;
    const el = document.querySelector<HTMLElement>(`[data-org="${CSS.escape(highlight)}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('org-highlight');
      const t = setTimeout(() => el.classList.remove('org-highlight'), 2400);
      const done = setTimeout(() => onHighlightDone?.(), 200);
      return () => {
        clearTimeout(t);
        clearTimeout(done);
      };
    }
    onHighlightDone?.();
  }, [highlight, onHighlightDone]);

  return (
    <div className="pantheons">
      <h1 className="page-title">Фракции и Ордены</h1>
      <p className="cosmology-intro">
        Знамёна, под которыми сражается Азерот: государства и союзы, священные ордены и тёмные
        культы. У каждого героя — своя принадлежность.
      </p>

      {groups.length === 0 && <p className="empty-state">Фракции пока не добавлены.</p>}

      {groups.map(([cat, list]) => {
        const meta = categoryMeta(cat);
        return (
          <section className="pantheon" key={cat} style={{ ['--accent' as string]: meta.accent }}>
            <header className="pantheon-head">
              <h2>{cat}</h2>
              {meta.intro && <p>{meta.intro}</p>}
            </header>
            <div className="pantheon-grid">
              {list.map((o) => (
                <div
                  className="member-card member-clickable"
                  key={o.id}
                  data-org={o.name}
                  onClick={() => onSelect(o)}
                  style={{ ['--mc' as string]: o.color || meta.accent }}
                >
                  {o.emblem ? (
                    <img className="member-emblem-img" src={assetUrl(o.emblem)} alt={o.name} />
                  ) : (
                    <span className="member-glyph">{o.name.charAt(0)}</span>
                  )}
                  <div className="member-body">
                    <h3 className="member-name">{o.name}</h3>
                    <span className="member-domain">{o.domain}</span>
                    <p className="member-note">{o.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
