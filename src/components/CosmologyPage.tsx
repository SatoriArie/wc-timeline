import { cosmicPairs, type CosmicForce } from '../data/cosmology';

function ForceCard({ force, side }: { force: CosmicForce; side: 'light' | 'dark' }) {
  return (
    <div
      className={`force-card ${side}`}
      style={{ ['--force' as string]: force.color }}
    >
      <div className="force-orb" />
      <h3 className="force-name">{force.name}</h3>
      <span className="force-epithet">{force.epithet}</span>
      <p className="force-essence">{force.essence}</p>
      <div className="force-section">
        <span className="force-label">Воплощения</span>
        <ul className="force-list">
          {force.embodiments.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </div>
      <div className="force-school">{force.school}</div>
    </div>
  );
}

export default function CosmologyPage() {
  return (
    <div className="cosmology">
      <h1 className="page-title">Космология Азерота</h1>
      <p className="cosmology-intro">
        Мироздание держится на шести фундаментальных силах, что существуют тремя противоборствующими
        парами вокруг Великой Запредельной Тьмы. Их вечная борьба — первопричина всех войн, что
        сотрясали Азерот от Сотворения Миров до наших дней.
      </p>

      {cosmicPairs.map((pair) => (
        <section className="cosmic-pair" key={pair.id}>
          <header className="cosmic-pair-head">
            <h2>{pair.title}</h2>
            <p>{pair.axis}</p>
          </header>
          <div className="cosmic-duel">
            <ForceCard force={pair.light} side="light" />
            <div className="cosmic-vs" aria-hidden="true">
              <span>⚖</span>
            </div>
            <ForceCard force={pair.dark} side="dark" />
          </div>
        </section>
      ))}
    </div>
  );
}
