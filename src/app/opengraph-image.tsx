import { ImageResponse } from 'next/og';
import { headlineFigures, identity, positioning } from '@/content/facts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${identity.name} — ${identity.brandLine}`;

/**
 * The share card carries the same argument as the masthead: the brand line, the
 * domain, and the figures. A share preview that shows only a name wastes the
 * one impression LinkedIn gives.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#12110f',
          color: '#f5f3f0',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 24, letterSpacing: 2, color: '#f0a63a', textTransform: 'uppercase' }}>
            {identity.brandLine}
          </div>
          <div style={{ fontSize: 82, fontWeight: 600, letterSpacing: -2, marginTop: 18, lineHeight: 1 }}>
            {identity.name}
          </div>
          <div style={{ fontSize: 30, color: '#a8a29a', marginTop: 22, maxWidth: 940, lineHeight: 1.35 }}>
            Offline-first mobile for field crews, approval and procure-to-pay workflows, and the release gate that
            decides what ships.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 56 }}>
          {headlineFigures.map((figure) => (
            <div key={figure.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 44, fontWeight: 600 }}>{figure.value}</div>
              <div style={{ fontSize: 20, color: '#a8a29a', marginTop: 4, maxWidth: 200 }}>{figure.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 22, color: '#7d776f' }}>
          {`${identity.location} · ${identity.timezone} · ${positioning.availability}`}
        </div>
      </div>
    ),
    size,
  );
}
