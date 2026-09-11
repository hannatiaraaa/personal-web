/**
 * Mechanism diagrams. Altonaut screenshots cannot be published; the mechanism
 * can be drawn from scratch, and the mechanism is the part worth showing.
 *
 * Colours come from the theme tokens so both themes stay legible, and each
 * diagram is `role="img"` with a text description — a screen reader gets the
 * finding, not a list of shapes.
 */

const label = 'font-mono text-[11px]';

function Frame({
  title,
  description,
  viewBox,
  children,
}: {
  title: string;
  description: string;
  viewBox: string;
  children: React.ReactNode;
}) {
  return (
    <figure
      // The diagram scrolls sideways on narrow screens, so the scroll container
      // is focusable — otherwise a keyboard user cannot reach the right-hand
      // half of it at all.
      tabIndex={0}
      role="group"
      aria-label={`Diagram: ${title}`}
      className="my-8 overflow-x-auto rounded-lg border border-line bg-surface p-4 sm:p-6"
    >
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={description}
        className="h-auto w-full min-w-[34rem]"
        fill="none"
      >
        {children}
      </svg>
      <figcaption className="mt-4 text-meta text-ink-muted">{title}</figcaption>
    </figure>
  );
}

export function DraftOwnershipDiagram() {
  const lane = { a: 74, b: 146 };
  const t = { read: 120, write: 300, reconnect: 470 };

  return (
    <Frame
      viewBox="0 0 620 210"
      title="Both devices read the same record. The online device moves it on. Without an ownership statement, the returning device's older draft was applied on top; the late-draft guard rejects it instead."
      description="A timeline with two device lanes. Both devices read revision one of a record. The online device writes revision two. The device that was offline for days returns holding a draft built from revision one; the late-draft-sync guard rejects it rather than overwriting revision two."
    >
      {/* time axis */}
      <line x1="40" y1="186" x2="590" y2="186" stroke="var(--line-strong)" strokeWidth="1" />
      <text x="40" y="204" className={label} fill="var(--ink-faint)">
        time
      </text>
      <path d="M584 182l6 4-6 4" stroke="var(--line-strong)" strokeWidth="1.2" strokeLinecap="round" />

      {/* lanes */}
      {(
        [
          { y: lane.a, name: 'Device A', note: 'offline, days' },
          { y: lane.b, name: 'Device B', note: 'online' },
        ] as const
      ).map(({ y, name, note }) => (
        <g key={name}>
          <text x="40" y={y - 10} className={label} fill="var(--ink)">
            {name}
          </text>
          <text x="40" y={y + 4} className={label} fill="var(--ink-faint)">
            {note}
          </text>
          <line x1="40" y1={y + 18} x2="590" y2={y + 18} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
        </g>
      ))}

      {/* shared read */}
      <line x1={t.read} y1={lane.a + 18} x2={t.read} y2={lane.b + 18} stroke="var(--line-strong)" strokeWidth="1" />
      {[lane.a, lane.b].map((y) => (
        <circle key={y} cx={t.read} cy={y + 18} r="4.5" fill="var(--ink-muted)" />
      ))}
      <text x={t.read - 18} y={lane.b + 44} className={label} fill="var(--ink-muted)">
        both read rev 1
      </text>

      {/* B writes rev 2 */}
      <circle cx={t.write} cy={lane.b + 18} r="4.5" fill="var(--ink)" />
      <text x={t.write - 16} y={lane.b + 44} className={label} fill="var(--ink)">
        writes rev 2
      </text>

      {/* A returns with a rev-1 draft */}
      <circle cx={t.reconnect} cy={lane.a + 18} r="4.5" fill="var(--signal)" />
      <text x={t.reconnect - 44} y={lane.a + 6} className={label} fill="var(--signal)">
        returns holding a rev 1 draft
      </text>

      {/* the write that used to land */}
      <path
        d={`M${t.reconnect} ${lane.a + 18} L${t.reconnect} ${lane.b + 18}`}
        stroke="var(--signal)"
        strokeWidth="1.4"
        strokeDasharray="4 4"
      />
      {/* rejection marker */}
      <g transform={`translate(${t.reconnect - 7}, ${lane.b + 11})`}>
        <path d="M0 0l14 14M14 0L0 14" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <text x={t.reconnect + 16} y={lane.b + 24} className={label} fill="var(--signal)">
        late-draft guard rejects
      </text>
    </Frame>
  );
}

export function TaxLadderDiagram() {
  const col = { before: 60, after: 360 };
  const rows = [
    { y: 66, text: 'item line' },
    { y: 106, text: 'service scope' },
    { y: 146, text: 'document' },
  ] as const;

  return (
    <Frame
      viewBox="0 0 620 210"
      title="Tax applied at three levels composes: a level can tax an amount a level below it already taxed. One ladder has a single rung where tax happens, so there is no second one to compound."
      description="Left: three stacked levels — item line, service scope and document — each applying tax, with arrows showing tax compounding upward. Right: one ladder where subtotal and discount resolve first and tax is applied once, at a single rung."
    >
      {/* before */}
      <text x={col.before} y="34" className={label} fill="var(--ink-faint)">
        BEFORE — tax at every level
      </text>
      {rows.map(({ y, text }, i) => (
        <g key={text}>
          <rect
            x={col.before}
            y={y}
            width="190"
            height="28"
            rx="4"
            stroke="var(--line-strong)"
            strokeWidth="1"
            fill="var(--surface-sunk)"
          />
          <text x={col.before + 12} y={y + 18} className={label} fill="var(--ink)">
            {text} + tax
          </text>
          {i < rows.length - 1 && (
            <path
              d={`M${col.before + 220} ${y + 14} h22 v40 h-22`}
              stroke="var(--signal)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
      <text x={col.before} y="194" className={label} fill="var(--signal)">
        tax can land on taxed money
      </text>

      {/* after */}
      <text x={col.after} y="34" className={label} fill="var(--ink-faint)">
        AFTER — one ladder
      </text>
      {(
        [
          { y: 66, text: 'subtotal at source grain' },
          { y: 106, text: 'discount' },
          { y: 146, text: 'tax — once' },
        ] as const
      ).map(({ y, text }, i) => (
        <g key={text}>
          <rect
            x={col.after}
            y={y}
            width="200"
            height="28"
            rx="4"
            stroke={i === 2 ? 'var(--signal)' : 'var(--line-strong)'}
            strokeWidth={i === 2 ? '1.6' : '1'}
            fill={i === 2 ? 'var(--signal-wash)' : 'var(--surface-sunk)'}
          />
          <text x={col.after + 12} y={y + 18} className={label} fill="var(--ink)">
            {text}
          </text>
          {i < 2 && (
            <path
              d={`M${col.after + 100} ${y + 28} v12`}
              stroke="var(--line-strong)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
      <text x={col.after} y="194" className={label} fill="var(--ink-muted)">
        no second rung exists
      </text>
    </Frame>
  );
}

export function CaseStudyDiagram({ kind }: { kind: 'draft-ownership' | 'tax-ladder' }) {
  return kind === 'draft-ownership' ? <DraftOwnershipDiagram /> : <TaxLadderDiagram />;
}
