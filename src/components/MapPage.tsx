import { useMemo } from 'react';
import type { Zone } from '../data/types';

interface Props {
  zones: Zone[];
  onSelectRegion: (region: string) => void;
}

interface Pin {
  region: string;
  x: number;
  y: number;
}

// Восточные королевства (правый материк) и Калимдор (левый материк)
const PINS: Pin[] = [
  { region: 'Лордерон', x: 720, y: 150 },
  { region: 'Каз Модан', x: 712, y: 300 },
  { region: 'Азерот', x: 700, y: 440 },
  { region: 'Северный Калимдор', x: 300, y: 150 },
  { region: 'Центральный Калимдор', x: 300, y: 300 },
  { region: 'Южный Калимдор', x: 300, y: 440 },
];

export default function MapPage({ zones, onSelectRegion }: Props) {
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const z of zones) m[z.region] = (m[z.region] ?? 0) + 1;
    return m;
  }, [zones]);

  return (
    <div className="mapview">
      <h1 className="page-title">Карта Азерота</h1>
      <p className="cosmology-intro">
        Два великих материка, расколотых Великим Разломом. Выбери землю, чтобы открыть её летопись.
      </p>

      <div className="map-frame">
        <svg viewBox="0 0 1000 600" className="map-svg" role="img" aria-label="Карта Азерота">
          <defs>
            <radialGradient id="sea" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#13233f" />
              <stop offset="100%" stopColor="#0a1424" />
            </radialGradient>
            <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a4a3a" />
              <stop offset="100%" stopColor="#243524" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="1000" height="600" fill="url(#sea)" />

          {/* декоративные параллели */}
          {[120, 240, 360, 480].map((y) => (
            <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(92,200,255,0.06)" strokeWidth="1" />
          ))}

          {/* Калимдор */}
          <path
            className="continent"
            d="M250 70 C 360 60 400 120 380 200 C 410 250 370 300 390 360 C 360 440 330 520 270 530 C 200 520 180 440 210 380 C 180 320 200 260 220 210 C 200 150 200 90 250 70 Z"
          />
          {/* Восточные королевства */}
          <path
            className="continent"
            d="M690 60 C 770 70 790 130 760 190 C 800 240 770 300 780 360 C 760 440 740 520 690 525 C 640 510 650 440 660 380 C 630 320 660 250 660 200 C 640 140 650 80 690 60 Z"
          />

          {/* подписи материков */}
          <text x="300" y="560" className="map-continent-label">Калимдор</text>
          <text x="715" y="560" className="map-continent-label">Восточные королевства</text>

          {/* роза ветров */}
          <g transform="translate(500 90)" className="compass">
            <circle r="34" />
            <path d="M0 -30 L7 0 L0 30 L-7 0 Z" />
            <path d="M-30 0 L0 -7 L30 0 L0 7 Z" />
            <text y="-40" className="compass-n">С</text>
          </g>

          {/* пины регионов */}
          {PINS.map((p) => {
            const n = counts[p.region] ?? 0;
            return (
              <g
                key={p.region}
                className="map-pin"
                transform={`translate(${p.x} ${p.y})`}
                onClick={() => onSelectRegion(p.region)}
                role="button"
                tabIndex={0}
              >
                <circle className="map-pin-halo" r="22" />
                <path className="map-pin-mark" d="M0 -11 L11 0 L0 11 L-11 0 Z" />
                <text className="map-pin-label" y="-26">
                  {p.region}
                </text>
                <text className="map-pin-count" y="5">
                  {n}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
