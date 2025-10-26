import { BoardState } from "./types.js";

/**
 * Checks if a board state has already been computed/explored.
 * Returns true if the state exists in the visited set.
 */
export function wasPreviouslyComputed(boardState: BoardState, visitedSet: Set<BoardState>): boolean {
  return visitedSet.has(boardState)
}

/**
 * Records that a board state has been explored by adding it to the visited set.
 * The board state is serialized to a string for storage.
 */
export function recordExploredState(boardState: BoardState, visitedSet: Set<BoardState>): void {
  visitedSet.add(boardState)
}
