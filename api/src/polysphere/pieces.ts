import { Piece } from "./types.js";

type PieceShape = boolean[][];

export const PIECE_SHAPES: PieceShape[] = [
  // Index 0 - empty placeholder
  [],

  // Piece 1
  [
    [true, true, true],
    [true, false, true],
  ],

  // Piece 2
  [
    [false, false, true, true],
    [true, true, true, false],
  ],

  // Piece 3
  [
    [false, true, false],
    [true, true, false],
    [false, true, true],
  ],

  // Piece 4
  [
    [false, true, false],
    [true, true, true],
  ],

  // Piece 5
  [
    [false, true, false, false],
    [true, true, true, true],
  ],

  // Piece 6
  [
    [false, true, true],
    [true, true, true],
  ],

  // Piece 7
  [
    [false, true, true],
    [true, true, false],
  ],

  // Piece 8
  [
    [true, true],
    [true, false],
    [true, false],
  ],

  // Piece 9
  [
    [true, true, true],
    [false, false, true],
  ],

  // Piece 10
  [
    [true, false, false, false],
    [true, true, true, true],
  ],

  // Piece 11
  [
    [true, false],
    [true, true],
  ],

  // Piece 12
  [
    [true, true, false],
    [false, true, true],
    [false, false, true],
  ],
];

/**
 * Get a piece by its ID
 */
export function getPiece(id: number): Piece {
  if (id < 1 || id > 12) {
    throw new Error(`Piece ${id} not found`);
  }
  return {
    id,
    shape: PIECE_SHAPES[id],
  };
}

/**
 * Calculate the bounding box area (width × height) of a piece
 */
export function getPieceBoundingBoxArea(piece: Piece): number {
  return piece.shape.length * piece.shape[0].length;
}
