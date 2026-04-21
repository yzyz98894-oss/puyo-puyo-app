'use client';

import { useGame } from '@/hooks/useGame';
import { GameBoard } from './GameBoard';
import { NextPanel } from './NextPanel';

const PAUSEABLE: string[] = ['falling', 'locking', 'clearing', 'dropping'];

export function PuyoGame() {
  const { state, start, pause, resume } = useGame();
  const { phase, score, bestScore, chain, next } = state;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      {/* Title */}
      <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mb-6 select-none">
        ぷよぷよ
      </h1>

      <div className="flex items-start gap-4">
        {/* Board */}
        <div className="relative">
          <GameBoard state={state} />

          {/* Overlay: idle / gameover */}
          {(phase === 'idle' || phase === 'gameover') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm">
              {phase === 'gameover' && (
                <p className="text-2xl font-bold text-red-400 mb-2">GAME OVER</p>
              )}
              <p className="text-white/60 text-sm mb-4">
                {phase === 'idle' ? 'スタートしてください' : `スコア: ${score}`}
              </p>
              <button
                onClick={start}
                className="px-6 py-2 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/30 active:scale-95"
              >
                {phase === 'idle' ? 'スタート' : 'もう一度'}
              </button>
            </div>
          )}

          {/* Overlay: paused */}
          {phase === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/75 backdrop-blur-sm">
              <p className="text-3xl font-black text-white mb-2">⏸ PAUSE</p>
              <p className="text-white/50 text-xs mb-5">Esc / P で再開</p>
              <button
                onClick={resume}
                className="px-6 py-2 rounded-full font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
              >
                再開
              </button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          <NextPanel next={next} score={score} bestScore={bestScore} chain={chain} />

          {/* Pause button */}
          {PAUSEABLE.includes(phase) && (
            <button
              onClick={pause}
              className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-md px-4 py-2 text-sm font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              ⏸ 一時停止
            </button>
          )}
        </div>
      </div>

      {/* Controls hint */}
      <div className="mt-6 text-white/30 text-xs text-center space-y-1">
        <p>← → 移動　↑ 回転　Z 逆回転　↓ 落下　Space ハードドロップ</p>
        <p>Esc / P で一時停止</p>
      </div>
    </div>
  );
}
