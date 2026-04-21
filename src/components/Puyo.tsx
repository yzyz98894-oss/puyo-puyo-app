'use client';

import { COLOR_STYLES } from '@/lib/constants';
import type { PuyoColor } from '@/lib/types';

interface PuyoProps {
  color: PuyoColor;
  size?: number;
  clearing?: boolean;
  ghost?: boolean;
}

export function Puyo({ color, size = 40, clearing = false, ghost = false }: PuyoProps) {
  if (!color) return null;
  const { bg, glow } = COLOR_STYLES[color];

  return (
    <div
      style={{ width: size, height: size }}
      className={[
        'rounded-full bg-gradient-to-br relative',
        bg,
        ghost ? 'opacity-30' : `shadow-lg ${glow}`,
        clearing ? 'animate-pulse scale-110' : '',
      ].join(' ')}
    >
      {/* highlight */}
      <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-white/50" />
    </div>
  );
}
