type Props = {
  legend: string;
  title: string;
  lead?: string;
};

export function PageHeader({ legend, title, lead }: Props) {
  return (
    <header className="border-b border-line pb-8">
      <p className="legend">{legend}</p>
      <h1 className="mt-3 max-w-3xl text-balance text-h1 font-semibold tracking-[-0.02em] text-ink">{title}</h1>
      {lead && <p className="mt-4 max-w-2xl text-lead text-ink-muted">{lead}</p>}
    </header>
  );
}
