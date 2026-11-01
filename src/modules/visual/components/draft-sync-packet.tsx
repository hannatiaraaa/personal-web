import type { CSSProperties } from 'react';
import type { SyncMessage } from '@/modules/visual/lib/draft-sync';
import { packetPath, type DrawingPoint } from '@/modules/visual/lib/draft-sync-drawing';

/** Where the packet's flight starts and ends, read by its keyframes in draft-sync-drawing.css. */
type PacketStyle = CSSProperties & Record<'--from-x' | '--from-y' | '--to-x' | '--to-y', string>;

function packetStyle(from: DrawingPoint, to: DrawingPoint): PacketStyle {
  return { '--from-x': `${from.x}px`, '--from-y': `${from.y}px`, '--to-x': `${to.x}px`, '--to-y': `${to.y}px` };
}

/** A message in flight along its link, labelled with what it carries. */
export function DraftSyncPacket({ message }: { message: SyncMessage }) {
  const path = packetPath(message);
  if (!path) return null;
  return (
    <g
      className='draft-sync-packet'
      data-delivery={message.delivery}
      data-from={message.from}
      style={packetStyle(path.from, path.to)}
    >
      <circle
        r='7'
        className='draft-sync-packet-dot'
      />
      <text
        y='24'
        textAnchor='middle'
        fontSize='12'
        className='draft-sync-packet-label font-mono'
      >
        {message.payload}
      </text>
    </g>
  );
}
