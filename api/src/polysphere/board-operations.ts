import { PuzzleState, Position, Board } from "./types.js";

/**
 * Creates an empty 5x11 board filled with zeros
 * @returns {Board} A new empty board
 */
export function createEmptyBoard(): Board {
  return Array(5)
    .fill(null)
    .map(() => Array(11).fill(0));
}

export function placePiece(
  state: PuzzleState,
  pieceId: number,
  rotations: number,
  flipped: boolean,
  position: Position,
): PuzzleState {
  throw new Error("placePiece not implemented");
}
