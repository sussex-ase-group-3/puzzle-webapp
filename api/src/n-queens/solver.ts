import {
  flipBoard,
  isComplete,
  isSafe,
  placeQueen,
  rotateBoard,
} from "./board-operations.js";
import { BoardState } from "./types.js";
import { recordExploredState, wasPreviouslyComputed } from "./visited-set.js";

let visitedSet: Set<String> = new Set();

/**
 * Resets the visited set to clear any previous computation state.
 * Should be called before starting a new solve operation.
 */
export function resetVisitedSet(): void {
  visitedSet.clear();
}

/**
 * Solves the N-Queens problem and returns all solutions including symmetric variants.
 * Uses backtracking with visited state optimization to avoid redundant computation.
 *
 * @param boardState - The current state of the board
 * @returns Array of all solutions, where each solution includes the original and its 7 symmetric variants
 */
export function solve(boardState: BoardState): Set<String> {
  if (wasPreviouslyComputed(boardState, visitedSet)) {
    return new Set();
  }

  let results: Set<String> = new Set();
  for (let _ = 0; _ < 4; _++) {
    boardState = rotateBoard(boardState);
    recordExploredState(boardState, visitedSet);
    recordExploredState(flipBoard(boardState), visitedSet);
    results.add(boardState.toString());
    results.add(flipBoard(boardState).toString());
  }

  if (isComplete(boardState)) {
    return results;
  }

  results = new Set();

  let first_empty = boardState.findIndex((i) => i == -1);
  for (let i = 0; i < boardState.length; i++) {
    if (isSafe(boardState, [first_empty, i])) {
      results = results.union(solve(placeQueen(boardState, [first_empty, i])));
    }
  }

  return results;
}
