import { useMemo } from 'react';

/** Анимированный магический фон: частицы + арканный туман. */
export default function Background() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 10 + 6,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.4 + 0.3,
      })),
    [],
  );

  return (
    <div className="background-effects" aria-hidden="true">
      <div className="magic-particles" />
      <div className="arcane-mist" />
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            borderRadius: '50%',
            background: 'var(--arcane-blue)',
            boxShadow: '0 0 10px var(--arcane-blue)',
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
