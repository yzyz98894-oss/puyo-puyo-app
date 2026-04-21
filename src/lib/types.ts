export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | null;

export type Cell = PuyoColor;

export type Board = Cell[][];

export type Position = { row: number; col: number };

export type Rotation = 0 | 1 | 2 | 3;

export interface Tsumo {
  main: PuyoColor;
  sub: PuyoColor;
  position: Position;
  rotation: Rotation;
}

export type GamePhase = 'idle' | 'falling' | 'locking' | 'clearing' | 'dropping' | 'paused' | 'gameover';

export interface GameState {
  board: Board;
  current: Tsumo;
  next: Tsumo;
  score: number;
  bestScore: number;
  chain: number;
  phase: GamePhase;
  pausedPhase: GamePhase | null;
  clearingCells: Position[];
}
