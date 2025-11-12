import { create } from 'zustand';
import { makeParallelogramBoard } from '../lib/board';
import { Piece, Pin } from '../lib/piece';
import { solveAll, decodeSolutionRows } from '../lib/solver';
import { serializeCell } from '../lib/hex';

export type Solution = Pin[]; // concrete placements

export type PuzzleState = {
  width: number; height: number; hexSize: number; allowMirror: boolean;
  blocked: Set<string>;
  pieces: Piece[];
  pins: Pin[];
  solutions: Solution[];
  solving: boolean;
  actions: {
    toggleBlocked: (q: number, r: number) => void;
    addPiece: (p: Piece) => void;
    clearPieces: () => void;
    addPin: (pin: Pin) => void;
    removePinAt: (q: number, r: number) => void;
    clearPins: () => void;
    solve: (limit?: number) => void;
    resetSolutions: () => void;
  }
};

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  width: 11, height: 5, hexSize: 22, allowMirror: true,
  blocked: new Set<string>(),
  pieces: [],
  pins: [],
  solutions: [],
  solving: false,
  actions: {
    toggleBlocked(q, r) {
      const k = serializeCell({ q, r });
      const next = new Set(get().blocked);
      if (next.has(k)) next.delete(k); else next.add(k);
      set({ blocked: next });
    },
    addPiece(p) { set({ pieces: [...get().pieces, p] }); },
    clearPieces() { set({ pieces: [] }); },
    addPin(pin) { set({ pins: [...get().pins, pin] }); },
    removePinAt(q, r) {
      const k = serializeCell({ q, r });
      const pins = get().pins.filter(pin => serializeCell(pin.origin) !== k);
      set({ pins });
    },
    clearPins() { set({ pins: [] }); },
    resetSolutions() { set({ solutions: [] }); },
    solve(limit) {
      const { width, height, pieces, pins, blocked, allowMirror } = get();
      set({ solving: true, solutions: [] });
      const board = makeParallelogramBoard(width, height);
      const out = solveAll({ board, pieces, pins, blocked, allowMirror, limit });
      const sols = out.rows.map(r => decodeSolutionRows(r, pins, pieces));
      set({ solutions: sols, solving: false });
    },
  }
}));
