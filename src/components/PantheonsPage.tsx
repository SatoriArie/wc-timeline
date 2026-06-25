import { pantheons } from '../data/pantheons';

export default function PantheonsPage() {
  return (
    <div className="pantheons">
      <h1 className="page-title">Пантеоны и Сонмы</h1>
      <p className="cosmology-intro">
        Сильнейшие сущности, чья воля кроила судьбу Азерота: миродержцы-Титаны, их крылатые
        хранители — драконьи аспекты, и паразиты Бездны — Древние Боги.
      </p>

      {pantheons.map((p) => (
        <section
          className="pantheon"
          key={p.id}
          style={{ ['--accent' as string]: p.accent }}
        >
          <header className="pantheon-head">
            <h2>{p.title}</h2>
            <p>{p.intro}</p>
          </header>
          <div className="pantheon-grid">
            {p.members.map((m) => (
              <div
                className="member-card"
                key={m.name}
                style={{ ['--mc' as string]: m.color || p.accent }}
              >
                <span className="member-glyph">{m.name.charAt(0)}</span>
                <div className="member-body">
                  <h3 className="member-name">{m.name}</h3>
                  <span className="member-domain">{m.domain}</span>
                  <p className="member-note">{m.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
