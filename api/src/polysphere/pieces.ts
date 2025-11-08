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

export const PIECE_COLOURS = [
  // Index 0 - empty placeholder
  "",

  // Piece 1
  "#e51e0f",

  // Piece 2
  "#f669a8",

  // Piece 3
  "#f8b7d7",

  // Piece 4
  "#1c8ed2",

  // Piece 5
  "#faed5b",

  // Piece 6
  "#b165a8",

  // Piece 7
  "#713d96",

  // Piece 8
  "#63ad68",

  // Piece 9
  "#ea6a22",

  // Piece 10
  "#129338",

  // Piece 11
  "#fed04e",

  // Piece 12
  "#8bcaf1"
]

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
    colour: PIECE_COLOURS[id]
  };
}

/**
 * Calculate the bounding box area (width × height) of a piece
 */
export function getPieceBoundingBoxArea(piece: Piece): number {
  return piece.shape.length * piece.shape[0].length;
}
