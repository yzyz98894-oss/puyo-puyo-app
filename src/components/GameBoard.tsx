'use client';

import { COLS, VISIBLE_ROWS } from '@/lib/constants';
import { getTsumoPositions, hardDrop } from '@/lib/tsumo';
import type { GameState } from '@/lib/types';
import type { Position } from '@/lib/types';
import { Puyo } from './Puyo';

const CELL_SIZE = 40;

interface GameBoardProps {
  state: GameState;
}

function posKey(p: Position) {
  return `${p.row},${p.col}`;
}

export function GameBoard({ state }: GameBoardProps) {
  const { board, current, phase, clearingCells } = state;
  const clearingSet = new Set(clearingCells.map(posKey));

  // Ghost positions with per-cell color
  const ghostPositions = new Map<string, import('@/lib/types').PuyoColor>();
  if (phase === 'falling') {
    const ghost = hardDrop(board, current);
    const [ghostMain, ghostSub] = getTsumoPositions(ghost);
    ghostPositions.set(posKey(ghostMain), current.main);
    ghostPositions.set(posKey(ghostSub), current.sub);
  }

  // Current tsumo positions
  const currentPositions = new Map<string, string>();
  if (phase === 'falling' || phase === 'locking') {
    const [main, sub] = getTsumoPositions(current);
    currentPositions.set(posKey(main), current.main!);
    currentPositions.set(posKey(sub), current.sub!);
  }

  const offsetRow = board.length - VISIBLE_ROWS;

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/20 bg-black/40 backdrop-blur-md"
      style={{ width: COLS * CELL_SIZE, height: VISIBLE_ROWS * CELL_SIZE }}
    >
      {/* Grid lines */}
      <div className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${VISIBLE_ROWS}, ${CELL_SIZE}px)`,
        }}
      >
        {Array.from({ length: VISIBLE_ROWS * COLS }).map((_, i) => (
          <div key={i} className="border border-white/5" />
        ))}
      </div>

      {/* Cells */}
      {Array.from({ length: VISIBLE_ROWS }, (_, visRow) => {
        const boardRow = visRow + offsetRow;
        return Array.from({ length: COLS }, (_, col) => {
          const key = posKey({ row: boardRow, col });
          const boardColor = board[boardRow]?.[col];
          const currentColor = currentPositions.get(key);
          const ghostColor = ghostPositions.get(key) ?? null;
          const isGhost = ghostColor !== null && !currentColor;
          const isClearing = clearingSet.has(key);

          const color = currentColor || boardColor || null;

          if (!color && !isGhost) return null;

          return (
            <div
              key={key}
              className="absolute flex items-center justify-center"
              style={{
                left: col * CELL_SIZE,
                top: visRow * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            >
              {isGhost ? (
                <Puyo color={ghostColor} size={CELL_SIZE - 4} ghost />
              ) : (
                <Puyo color={color as any} size={CELL_SIZE - 4} clearing={isClearing} />
              )}
            </div>
          );
        });
      })}
    </div>
  );
}
