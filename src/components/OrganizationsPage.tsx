import { organizations } from '../data/organizations';

export default function OrganizationsPage() {
  return (
    <div className="pantheons">
      <h1 className="page-title">Фракции и Ордены</h1>
      <p className="cosmology-intro">
        Знамёна, под которыми сражается Азерот: государства и союзы, священные ордены и тёмные
        культы. У каждого героя — своя принадлежность.
      </p>

      {organizations.map((g) => (
        <section className="pantheon" key={g.id} style={{ ['--accent' as string]: g.accent }}>
          <header className="pantheon-head">
            <h2>{g.title}</h2>
            <p>{g.intro}</p>
          </header>
          <div className="pantheon-grid">
            {g.members.map((m) => (
              <div
                className="member-card"
                key={m.name}
                style={{ ['--mc' as string]: m.color || g.accent }}
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
