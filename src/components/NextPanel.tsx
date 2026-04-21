'use client';

import type { Tsumo } from '@/lib/types';
import { Puyo } from './Puyo';

interface NextPanelProps {
  next: Tsumo;
  score: number;
  bestScore: number;
  chain: number;
}

export function NextPanel({ next, score, bestScore, chain }: NextPanelProps) {
  return (
    <div className="flex flex-col gap-4 min-w-[120px]">
      {/* NEXT */}
      <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-md p-3">
        <p className="text-xs font-bold text-white/50 tracking-widest mb-2">NEXT</p>
        <div className="flex flex-col items-center gap-1">
          <Puyo color={next.sub} size={36} />
          <Puyo color={next.main} size={36} />
        </div>
      </div>

      {/* SCORE */}
      <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-md p-3">
        <p className="text-xs font-bold text-white/50 tracking-widest mb-1">SCORE</p>
        <p className="text-xl font-mono font-bold text-white tabular-nums">
          {String(score).padStart(6, '0')}
        </p>
      </div>

      {/* BEST */}
      <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-md p-3">
        <p className="text-xs font-bold text-white/50 tracking-widest mb-1">BEST</p>
        <p className="text-xl font-mono font-bold text-yellow-300 tabular-nums">
          {String(bestScore).padStart(6, '0')}
        </p>
      </div>

      {/* CHAIN */}
      {chain > 0 && (
        <div className="rounded-xl border border-purple-400/40 bg-purple-900/40 backdrop-blur-md p-3 text-center animate-bounce">
          <p className="text-xs font-bold text-purple-300 tracking-widest">{chain} CHAIN!</p>
        </div>
      )}
    </div>
  );
}
