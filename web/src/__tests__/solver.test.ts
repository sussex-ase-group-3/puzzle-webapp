import { describe, it, expect } from 'vitest';
import { makeParallelogramBoard } from '../lib/board';
import { solveAll } from '../lib/solver';

// Tiny sanity: 2x2 board with two domino-like dihexes should have at least 2 tilings.
const di: { q:number; r:number }[] = [{q:0,r:0},{q:1,r:0}];

describe('solver small', () => {
  it('counts solutions on 2x2 with two dihexes', () => {
    const board = makeParallelogramBoard(2,2);
    const pieces = [
      { id:'A', name:'A', cells: di },
      { id:'B', name:'B', cells: di },
    ];
    const pins: any[] = [];
    const res = solveAll({ board, pieces, pins, blocked: new Set(), allowMirror: false });
    expect(res.rows.length).toBeGreaterThanOrEqual(2);
  });
});
