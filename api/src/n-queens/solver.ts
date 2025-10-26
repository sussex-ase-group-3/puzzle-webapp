import { flipBoard, isComplete, placeQueen, rotateBoard } from "./board-operations.js";
import { BoardState } from "./types.js";
import { recordExploredState, wasPreviouslyComputed } from "./visited-set.js";

let visitedSet: Set<BoardState> = new Set()

/**
 * Solves the N-Queens problem and returns all solutions including symmetric variants.
 * Uses backtracking with visited state optimization to avoid redundant computation.
 *
 * @param boardState - The current state of the board
 * @returns Array of all solutions, where each solution includes the original and its 7 symmetric variants
 */
export function solve(boardState: BoardState): Set<BoardState> {
  if (wasPreviouslyComputed(boardState, visitedSet)) { return new Set() }

  let results: Set<BoardState> = new Set()
  for (let _ = 0; _ < 4; _++) {
    boardState = rotateBoard(boardState)
    recordExploredState(boardState, visitedSet)
    recordExploredState(flipBoard(boardState), visitedSet)
    results.add(boardState)
    results.add(flipBoard(boardState))
  }

  if (isComplete(boardState)) {
    return results
  }

  results = new Set()

  let first_empty = boardState.findIndex((i) => i != -1)
  for (let i = 0; i < boardState.length; i++) {
    results = results.union(solve(placeQueen(boardState, [first_empty, i])))
  }

  return results
}
