import type { CSSProperties } from 'react';
import { formatMinor, type LadderResult } from '@/modules/visual/lib/tax-ladder';
import { receiptRevealStart, type ReceiptColumn } from '@/modules/visual/lib/tax-ladder-reveal';

/** Where in the scene's progress a row prints; read by `.tax-ladder-row` in tax-ladder.css. */
type RowStyle = CSSProperties & Record<'--row-start', number>;

function rowStyle(column: ReceiptColumn, index: number, count: number): RowStyle {
  return { '--row-start': receiptRevealStart(column, index, count) };
}

type Props = {
  column: ReceiptColumn;
  heading: string;
  result: LadderResult;
};

/**
 * One receipt, every row in the order it happened. A tax on already-taxed money
 * says so in words, never by colour alone. Stateless, so the server renders it as
 * the placeholder; each row prints as the scene reaches its `--row-start`.
 */
export function TaxLadderReceipt({ column, heading, result }: Props) {
  const headingId = `tax-ladder-${column}`;

  return (
    <section
      aria-labelledby={headingId}
      className='tax-ladder-receipt'
      data-column={column}
    >
      <h3
        id={headingId}
        className='legend tax-ladder-receipt-heading'
      >
        {heading}
      </h3>
      <ol className='tax-ladder-rows'>
        {result.rows.map((row, index) => (
          <li
            key={row.id}
            className='tax-ladder-row'
            data-kind={row.kind}
            data-level={row.level}
            data-tax-on-tax={row.isTaxOnTax ? '' : undefined}
            data-tax-ladder-total={row.kind === 'total' ? column : undefined}
            style={rowStyle(column, index, result.rows.length)}
          >
            <div className='tax-ladder-row-inner'>
              <span className='tax-ladder-row-label'>
                <span className='tax-ladder-row-name'>{row.label}</span>
                {row.detail && <span className='tax-ladder-row-detail tnum'>{row.detail}</span>}
              </span>
              {row.kind === 'tax' && <span className='tax-ladder-stamp'>{row.isTaxOnTax ? 'Tax on tax' : 'Tax'}</span>}
              <span className='tax-ladder-amount tnum'>{formatMinor(row.amount)}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
