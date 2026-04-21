import { CLEAR_THRESHOLD, CHAIN_BONUS, COLS, ROWS } from './constants';
import type { Board, Position } from './types';
import { cloneBoard } from './board';

export function findClearGroups(board: Board): Position[][] {
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const groups: Position[][] = [];

  function flood(row: number, col: number, color: string): Position[] {
    const stack = [{ row, col }];
    const group: Position[] = [];
    while (stack.length) {
      const { row: r, col: c } = stack.pop()!;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
      if (visited[r][c] || board[r][c] !== color) continue;
      visited[r][c] = true;
      group.push({ row: r, col: c });
      stack.push({ row: r - 1, col: c }, { row: r + 1, col: c }, { row: r, col: c - 1 }, { row: r, col: c + 1 });
    }
    return group;
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!visited[r][c] && board[r][c] !== null) {
        const group = flood(r, c, board[r][c] as string);
        if (group.length >= CLEAR_THRESHOLD) groups.push(group);
      }
    }
  }
  return groups;
}

export function clearGroups(board: Board, groups: Position[][]): Board {
  const next = cloneBoard(board);
  for (const group of groups) {
    for (const { row, col } of group) {
      next[row][col] = null;
    }
  }
  return next;
}

export function calcScore(groups: Position[][], chain: number): number {
  const cleared = groups.reduce((sum, g) => sum + g.length, 0);
  const bonus = CHAIN_BONUS[Math.min(chain, CHAIN_BONUS.length - 1)] || 1;
  return cleared * Math.max(bonus, 1);
}

export function getAllClearingPositions(groups: Position[][]): Position[] {
  return groups.flat();
}
