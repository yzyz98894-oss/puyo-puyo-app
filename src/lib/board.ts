import { COLS, ROWS } from './constants';
import type { Board, Cell } from './types';

export function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

export function getCell(board: Board, row: number, col: number): Cell {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
  return board[row][col];
}

export function setCell(board: Board, row: number, col: number, cell: Cell): Board {
  const next = cloneBoard(board);
  next[row][col] = cell;
  return next;
}

export function applyGravity(board: Board): Board {
  const next = createEmptyBoard();
  for (let col = 0; col < COLS; col++) {
    let writeRow = ROWS - 1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] !== null) {
        next[writeRow][col] = board[row][col];
        writeRow--;
      }
    }
  }
  return next;
}
