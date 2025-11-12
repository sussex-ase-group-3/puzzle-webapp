import { Axial, serializeCell } from './hex';

export type Board = {
  width: number;    // q dimension
  height: number;   // r dimension
  cells: Axial[];   // all axial cells on board
};

export function makeParallelogramBoard(width: number, height: number): Board {
  const cells: Axial[] = [];
  for (let r = 0; r < height; r++) {
    for (let q = 0; q < width; q++) cells.push({ q, r });
  }
  return { width, height, cells };
}

export function boardSet(board: Board): Set<string> {
  return new Set(board.cells.map(serializeCell));
}
