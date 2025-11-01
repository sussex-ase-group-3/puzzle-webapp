export type Board = number[][];
export type Position = readonly [row: number, col: number];

export type Piece = {
  id: number;
  shape: boolean[][]; // true = filled cell
};

export type PuzzleState = {
  board: Board;
  remainingPieces: Set<number>;
};
