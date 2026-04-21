import type { PuyoColor } from './types';

export const COLS = 6;
export const ROWS = 13;
export const VISIBLE_ROWS = 12;
export const SPAWN_COL = 2;
export const SPAWN_ROW = 0;
export const CLEAR_THRESHOLD = 4;

export const COLORS: PuyoColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

export const CHAIN_BONUS = [0, 0, 8, 16, 32, 64, 96, 128, 160, 192, 224];

export const COLOR_STYLES: Record<NonNullable<PuyoColor>, { bg: string; glow: string }> = {
  red:    { bg: 'from-red-400 to-red-600',       glow: 'shadow-red-500/60' },
  blue:   { bg: 'from-blue-400 to-blue-600',     glow: 'shadow-blue-500/60' },
  green:  { bg: 'from-green-400 to-green-600',   glow: 'shadow-green-500/60' },
  yellow: { bg: 'from-yellow-300 to-yellow-500', glow: 'shadow-yellow-400/60' },
  purple: { bg: 'from-purple-400 to-purple-600', glow: 'shadow-purple-500/60' },
};
