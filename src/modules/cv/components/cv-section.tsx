type Props = {
  legend: string;
  children: React.ReactNode;
};

/** Legend plus a gradient tick. One primitive, so every CV block matches. */
export function CvSection({ legend, children }: Props) {
  return (
    <section className='reveal'>
      <div className='flex items-center gap-3'>
        <span
          aria-hidden='true'
          className='from-sky-high to-signal-cyan h-3 w-0.5 rounded-full bg-linear-to-b'
        />
        <h2 className='legend'>{legend}</h2>
      </div>
      <div className='mt-5'>{children}</div>
    </section>
  );
}
