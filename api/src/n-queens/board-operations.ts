import { BoardState, Position } from "./types.js";
import  { cloneDeep }  from 'lodash';

/**
 * Places a queen at the specified position on the board.
 * Returns a new board state without mutating the original.
 */
export function placeQueen(boardState: BoardState, newPosition: Position): BoardState {
  const newBoardState = cloneDeep(boardState)
  const row = newPosition[0]
  const column = newPosition[1]
  newBoardState[row] = column
  return newBoardState
}

/**
 * Checks if placing a queen at the specified position would be safe
 * (no conflicts with existing queens).
 */
export function isSafe(boardState: BoardState, newPosition: Position): boolean {
  
  throw new Error("isSafe not implemented");
}

/**
 * Checks if the board state represents a complete solution
 * (all N queens are placed).
 */
export function isComplete(boardState: BoardState): boolean {
  throw new Error("isComplete not implemented");
}

/**
 * Returns a new board state rotated 90 degrees clockwise.
 */
export function rotateBoard(boardState: BoardState): BoardState {
  throw new Error("rotateBoard not implemented");
}

/**
 * Returns a new board state flipped horizontally.
 */
export function flipBoard(boardState: BoardState): BoardState {
  throw new Error("flipBoard not implemented");
}
