type Props = {
  legend: string;
  title: string;
  lead?: string;
};

export function PageHeader({ legend, title, lead }: Props) {
  return (
    <header className='relative isolate'>
      <div
        aria-hidden='true'
        className='sky-field'
      />
      <p className='legend'>{legend}</p>
      <h1 className='text-h1 text-ink mt-4 max-w-4xl font-semibold tracking-[-0.03em] text-balance'>{title}</h1>
      {lead && <p className='text-lead text-ink-muted mt-5 max-w-2xl text-pretty'>{lead}</p>}
    </header>
  );
}
