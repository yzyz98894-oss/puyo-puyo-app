import { COLORS, SPAWN_COL, SPAWN_ROW } from './constants';
import type { Board, Position, Rotation, Tsumo } from './types';
import { COLS, ROWS } from './constants';

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function createTsumo(): Tsumo {
  return {
    main: randomColor(),
    sub: randomColor(),
    position: { row: SPAWN_ROW, col: SPAWN_COL },
    rotation: 0,
  };
}

// Returns [mainPos, subPos] relative to main
export function getTsumoPositions(tsumo: Tsumo): [Position, Position] {
  const { row, col } = tsumo.position;
  const offsets: Record<Rotation, Position> = {
    0: { row: -1, col: 0 }, // sub is above
    1: { row: 0,  col: 1 }, // sub is right
    2: { row: 1,  col: 0 }, // sub is below
    3: { row: 0,  col: -1 },// sub is left
  };
  const off = offsets[tsumo.rotation];
  return [
    { row, col },
    { row: row + off.row, col: col + off.col },
  ];
}

export function isValidPosition(board: Board, tsumo: Tsumo): boolean {
  const [main, sub] = getTsumoPositions(tsumo);
  for (const pos of [main, sub]) {
    if (pos.col < 0 || pos.col >= COLS) return false;
    if (pos.row >= ROWS) return false;
    if (pos.row >= 0 && board[pos.row][pos.col] !== null) return false;
  }
  return true;
}

export function moveTsumo(board: Board, tsumo: Tsumo, dr: number, dc: number): Tsumo | null {
  const moved = {
    ...tsumo,
    position: { row: tsumo.position.row + dr, col: tsumo.position.col + dc },
  };
  return isValidPosition(board, moved) ? moved : null;
}

export function rotateTsumo(board: Board, tsumo: Tsumo, dir: 1 | -1): Tsumo {
  const next = ((tsumo.rotation + dir + 4) % 4) as Rotation;
  const rotated = { ...tsumo, rotation: next };
  if (isValidPosition(board, rotated)) return rotated;
  // Wall kick: try shifting left or right
  const kickLeft = moveTsumo(board, rotated, 0, -1);
  if (kickLeft) return kickLeft;
  const kickRight = moveTsumo(board, rotated, 0, 1);
  if (kickRight) return kickRight;
  return tsumo;
}

export function lockTsumo(board: Board, tsumo: Tsumo): Board {
  const [mainPos, subPos] = getTsumoPositions(tsumo);
  const next = board.map(r => [...r]);

  // ちぎれ: 各ぷよを独立して列の最下部まで落とす
  // 下にあるぷよから先に処理することで、同列の場合も正しく積み上がる
  const puyos = [
    { pos: mainPos, color: tsumo.main },
    { pos: subPos,  color: tsumo.sub  },
  ].filter(p => p.pos.row >= 0 && p.color !== null);

  puyos.sort((a, b) => b.pos.row - a.pos.row);

  for (const { pos, color } of puyos) {
    let landRow = pos.row;
    while (landRow + 1 < ROWS && next[landRow + 1][pos.col] === null) {
      landRow++;
    }
    next[landRow][pos.col] = color;
  }

  return next;
}

export function hardDrop(board: Board, tsumo: Tsumo): Tsumo {
  let current = tsumo;
  while (true) {
    const dropped = moveTsumo(board, current, 1, 0);
    if (!dropped) break;
    current = dropped;
  }
  return current;
}
