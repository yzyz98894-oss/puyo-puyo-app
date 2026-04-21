'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
import { createEmptyBoard, applyGravity } from '@/lib/board';
import { createTsumo, moveTsumo, rotateTsumo, lockTsumo, hardDrop, isValidPosition, getTsumoPositions } from '@/lib/tsumo';
import { findClearGroups, clearGroups, calcScore, getAllClearingPositions } from '@/lib/clear';
import { SPAWN_COL, SPAWN_ROW } from '@/lib/constants';
import type { GameState, Tsumo } from '@/lib/types';

type Action =
  | { type: 'START' }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'ROTATE_CW' }
  | { type: 'ROTATE_CCW' }
  | { type: 'HARD_DROP' }
  | { type: 'TICK' }
  | { type: 'LOCK' }
  | { type: 'CLEAR_TICK' }
  | { type: 'DROP_TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' };

function spawnTsumo(next: Tsumo): Tsumo {
  return { ...next, position: { row: SPAWN_ROW, col: SPAWN_COL } };
}

function loadBestScore(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem('puyoBestScore') || '0', 10);
}

function saveBestScore(score: number) {
  localStorage.setItem('puyoBestScore', String(score));
}

function initialState(): GameState {
  return {
    board: createEmptyBoard(),
    current: createTsumo(),
    next: createTsumo(),
    score: 0,
    bestScore: loadBestScore(),
    chain: 0,
    phase: 'idle',
    pausedPhase: null,
    clearingCells: [],
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START': {
      const current = createTsumo();
      const next = createTsumo();
      return {
        ...initialState(),
        bestScore: state.bestScore,
        current,
        next,
        phase: 'falling',
      };
    }

    case 'MOVE_LEFT': {
      if (state.phase !== 'falling') return state;
      const moved = moveTsumo(state.board, state.current, 0, -1);
      return moved ? { ...state, current: moved } : state;
    }

    case 'MOVE_RIGHT': {
      if (state.phase !== 'falling') return state;
      const moved = moveTsumo(state.board, state.current, 0, 1);
      return moved ? { ...state, current: moved } : state;
    }

    case 'MOVE_DOWN': {
      if (state.phase !== 'falling') return state;
      const moved = moveTsumo(state.board, state.current, 1, 0);
      if (moved) return { ...state, current: moved };
      return { ...state, phase: 'locking' };
    }

    case 'ROTATE_CW': {
      if (state.phase !== 'falling') return state;
      return { ...state, current: rotateTsumo(state.board, state.current, 1) };
    }

    case 'ROTATE_CCW': {
      if (state.phase !== 'falling') return state;
      return { ...state, current: rotateTsumo(state.board, state.current, -1) };
    }

    case 'HARD_DROP': {
      if (state.phase !== 'falling') return state;
      const dropped = hardDrop(state.board, state.current);
      return { ...state, current: dropped, phase: 'locking' };
    }

    case 'TICK': {
      if (state.phase !== 'falling') return state;
      const moved = moveTsumo(state.board, state.current, 1, 0);
      if (moved) return { ...state, current: moved };
      return { ...state, phase: 'locking' };
    }

    case 'LOCK': {
      if (state.phase !== 'locking') return state;
      const locked = lockTsumo(state.board, state.current);
      const groups = findClearGroups(locked);

      if (groups.length > 0) {
        const clearingCells = getAllClearingPositions(groups);
        return { ...state, board: locked, phase: 'clearing', clearingCells, chain: state.chain + 1 };
      }

      // No clears — spawn next
      const next = createTsumo();
      const spawned = spawnTsumo(state.next);

      if (!isValidPosition(locked, spawned)) {
        const best = Math.max(state.score, state.bestScore);
        saveBestScore(best);
        return { ...state, board: locked, bestScore: best, phase: 'gameover' };
      }

      return { ...state, board: locked, current: spawned, next, chain: 0, phase: 'falling' };
    }

    case 'CLEAR_TICK': {
      if (state.phase !== 'clearing') return state;
      const groups = findClearGroups(state.board);
      const cleared = clearGroups(state.board, groups);
      const gained = calcScore(groups, state.chain);
      const newScore = state.score + gained;
      return { ...state, board: cleared, score: newScore, phase: 'dropping', clearingCells: [] };
    }

    case 'DROP_TICK': {
      if (state.phase !== 'dropping') return state;
      const dropped = applyGravity(state.board);
      const groups = findClearGroups(dropped);

      if (groups.length > 0) {
        const clearingCells = getAllClearingPositions(groups);
        return { ...state, board: dropped, phase: 'clearing', clearingCells, chain: state.chain + 1 };
      }

      const next = createTsumo();
      const spawned = spawnTsumo(state.next);

      if (!isValidPosition(dropped, spawned)) {
        const best = Math.max(state.score, state.bestScore);
        saveBestScore(best);
        return { ...state, board: dropped, bestScore: best, phase: 'gameover' };
      }

      return { ...state, board: dropped, current: spawned, next, chain: 0, phase: 'falling' };
    }

    case 'PAUSE': {
      const pauseable: GamePhase[] = ['falling', 'locking', 'clearing', 'dropping'];
      if (!pauseable.includes(state.phase)) return state;
      return { ...state, phase: 'paused', pausedPhase: state.phase };
    }

    case 'RESUME': {
      if (state.phase !== 'paused' || !state.pausedPhase) return state;
      return { ...state, phase: state.pausedPhase, pausedPhase: null };
    }

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const phaseRef = useRef(state.phase);
  phaseRef.current = state.phase;

  // Fall timer — paused時は起動しない
  useEffect(() => {
    if (state.phase !== 'falling') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 800);
    return () => clearInterval(id);
  }, [state.phase]);

  // Lock delay
  useEffect(() => {
    if (state.phase !== 'locking') return;
    const id = setTimeout(() => dispatch({ type: 'LOCK' }), 300);
    return () => clearTimeout(id);
  }, [state.phase]);

  // Clear animation delay
  useEffect(() => {
    if (state.phase !== 'clearing') return;
    const id = setTimeout(() => dispatch({ type: 'CLEAR_TICK' }), 500);
    return () => clearTimeout(id);
  }, [state.phase]);

  // Drop after clear
  useEffect(() => {
    if (state.phase !== 'dropping') return;
    const id = setTimeout(() => dispatch({ type: 'DROP_TICK' }), 200);
    return () => clearTimeout(id);
  }, [state.phase]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const phase = phaseRef.current;

      // Pause / Resume: Escape or P
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (phase === 'paused') dispatch({ type: 'RESUME' });
        else dispatch({ type: 'PAUSE' });
        return;
      }

      if (phase !== 'falling') return;
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); dispatch({ type: 'MOVE_LEFT' }); break;
        case 'ArrowRight': e.preventDefault(); dispatch({ type: 'MOVE_RIGHT' }); break;
        case 'ArrowDown':  e.preventDefault(); dispatch({ type: 'MOVE_DOWN' }); break;
        case 'ArrowUp':    e.preventDefault(); dispatch({ type: 'ROTATE_CW' }); break;
        case 'z': case 'Z': dispatch({ type: 'ROTATE_CCW' }); break;
        case ' ':          e.preventDefault(); dispatch({ type: 'HARD_DROP' }); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);

  return { state, start, pause, resume, dispatch };
}
