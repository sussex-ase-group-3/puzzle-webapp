import { serializeCell } from './hex';
import { Board, boardSet } from './board';
import { Piece, Pin, generateAllTransforms, offsetShape, shapeFitsOnBoard, collides } from './piece';
import { Column, Row, buildDLX, solveDLX } from './exactCover';

export type SolveInput = {
  board: Board;
  pieces: Piece[];
  pins: Pin[];
  blocked: Set<string>;   // serialized Axial keys
  allowMirror: boolean;
  limit?: number;
};

export type Placement = Pin;
export type SolveResult = { rows: string[][] }; // row-id list per solution

export function buildExactCover({ board, pieces, pins, blocked, allowMirror }: SolveInput) {
  const bset = boardSet(board);

  // columns: all usable cells + each unpinned piece must be used once
  const usableCells = board.cells.filter(c => !blocked.has(serializeCell(c)));
  const cellCols: Column[] = usableCells.map(c => ({ name: `C:${serializeCell(c)}` }));
  const unpinnedIds = pieces.map(p => p.id).filter(id => !pins.some(pin => pin.pieceId === id));
  const pieceCols: Column[] = unpinnedIds.map(id => ({ name: `P:${id}` }));

  // fixed rows for pins
  const reserved = new Set<string>();
  const fixedRows: Row[] = [];
  for (const pin of pins) {
    const p = pieces.find(pp => pp.id === pin.pieceId); if (!p) continue;
    const trans = generateAllTransforms(p.cells, true).find(t => t.rot === pin.rot && t.mirror === pin.mirror);
    const shape = trans ? trans.shape : p.cells; // fallback
    const placed = offsetShape(shape, pin.origin);
    if (!shapeFitsOnBoard(placed, bset) || collides(placed, blocked)) {
      throw new Error(`Pinned piece out of board or blocked`);
    }
    for (const c of placed) reserved.add(serializeCell(c));
    const cols = placed.map(c => `C:${serializeCell(c)}`);
    fixedRows.push({ id: `PIN:${p.id}`, cols });
  }

  const forbid = new Set([...reserved, ...blocked]);
  const rows: Row[] = [];

  for (const p of pieces) {
    if (pins.some(pi => pi.pieceId === p.id)) continue; // already fixed
    const transes = generateAllTransforms(p.cells, allowMirror);
    const uniq = new Set<string>();
    for (const tr of transes) {
      for (const origin of board.cells) {
        const placed = offsetShape(tr.shape, origin);
        const key = placed.map(serializeCell).sort().join(';');
        if (uniq.has(key)) continue;
        if (!shapeFitsOnBoard(placed, bset)) continue;
        if (placed.some(c => forbid.has(serializeCell(c)))) continue;
        uniq.add(key);
        rows.push({
          id: `PL:${p.id}@${origin.q},${origin.r};r${tr.rot}${tr.mirror ? 'm' : ''}`,
          cols: [`P:${p.id}`, ...placed.map(c => `C:${serializeCell(c)}`)]
        });
      }
    }
  }
  return { columns: [...cellCols, ...pieceCols], rows: [...fixedRows, ...rows] };
}

export function solveAll(input: SolveInput): SolveResult {
  const { columns, rows } = buildExactCover(input);
  const header = buildDLX(columns, rows);
  const sols: string[][] = [];
  solveDLX(header, { limit: input.limit, onSolution: (rowIds) => sols.push(rowIds) });
  return { rows: sols };
}

export function decodeSolutionRows(rows: string[], pins: Pin[], pieces: Piece[]) {
  const dyn: Placement[] = [];
  for (const rid of rows) {
    if (rid.startsWith('PL:')) {
      const m = rid.match(/^PL:(.+?)@(\-?\d+),(\-?\d+);r(\d)(m)?$/);
      if (!m) continue;
      const [, pieceId, q, r, rot, mflag] = m;
      dyn.push({ pieceId, origin: { q: +q, r: +r }, rot: +rot, mirror: !!mflag });
    }
  }
  return [...pins, ...dyn];
}
