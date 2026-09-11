type Props = {
  legend: string;
  title: string;
  lead?: string;
};

export function PageHeader({ legend, title, lead }: Props) {
  return (
    <header className="relative isolate">
      <div aria-hidden="true" className="sky-field" />
      <p className="legend">{legend}</p>
      <h1 className="mt-4 max-w-4xl text-balance text-h1 font-semibold tracking-[-0.03em] text-ink">{title}</h1>
      {lead && <p className="mt-5 max-w-2xl text-pretty text-lead text-ink-muted">{lead}</p>}
    </header>
  );
}
