import { getPiece } from "./pieces.js"
import { Board, PuzzleState } from "./types.js";
import { getPieceBoundingBoxArea } from "./pieces.js";

/**
 * Select the next piece to place using largest-by-bounding-box heuristic
 * @param remainingPieces Set of piece IDs that haven't been placed yet
 * @returns The ID of the piece with the largest bounding box (width × height)
 * @throws Error if no pieces remain
 */
export function selectNextPiece(remainingPieces: Set<number>): number {
  if(remainingPieces.size === 0) {
     throw new Error("no pieces remain");
  }

  const largestShapeId = Array.from(remainingPieces).reduce((largestBoundSoFarId, currentShapeId) => {
      const largestBound = getPieceBoundingBoxArea(getPiece(largestBoundSoFarId));
      const currentBound = getPieceBoundingBoxArea(getPiece(currentShapeId));
      return currentBound > largestBound ? currentShapeId : largestBoundSoFarId;
  });

  return largestShapeId;
};

/**
 * Creates an empty 5x11 board filled with zeros
 * @returns {Board} A new empty board
 */
export function createEmptyBoard(): Board {
  return Array(5)
    .fill(null)
    .map(() => Array(11).fill(0));
}

/**
 * Check if the puzzle is complete (all pieces have been placed and all board spaces occupied)
 * @param state Current puzzle state
 * @returns true if no pieces remain AND all board spaces are occupied, false otherwise
 */
export function isComplete(state: PuzzleState): boolean {
  const board = state.board;
  const hasZero = board.some(row => row.some(col => col === 0));

  if (state.remainingPieces.size === 0 && !hasZero) {
    return true;
  };
  return false;
};
