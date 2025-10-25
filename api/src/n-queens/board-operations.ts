import { BoardState, Position } from "./types.js";
import  { cloneDeep, size }  from 'lodash';

/**
 * Places a queen at the specified position on the board.
 * Returns a new board state without mutating the original.
 */
export function placeQueen(boardState: BoardState, newPosition: Position): BoardState {
  
  const n = size(boardState)
  const newBoardState = cloneDeep(boardState)
  const row = newPosition[0]
  const column = newPosition[1]

  if (
     row < 0 || row >= n ||
     column < 0 || column >= n
  ) {
    throw new Error("Inputs are out of bounds")
  }
  if (newBoardState[row] !== -1) {
    throw new Error("There is already a queen in this row");
  }
  newBoardState[row] = column
  return newBoardState
}

/**
 * Checks if placing a queen at the specified position would be safe
 * (no conflicts with existing queens).
 * check how every queen position compares to current position against current queen
 * the distance up and across between queens must be the same distance for it to be safe
 * the difference between col indexes and row index must not be the same
 */
export function isSafe(boardState: BoardState, newPosition: Position): boolean {

  const newPositionRow = newPosition[0]
  const newPositionCol = newPosition[1]
  let isSafeSpace = true;
  
  boardState.forEach((currentColumn, currentRow) => {

    if(currentColumn !== -1){

      const columnDifference = Math.abs(currentColumn - newPositionCol);
      const rowDifference = Math.abs(currentRow - newPositionRow)

      if (columnDifference === rowDifference) {
        isSafeSpace = false
        
      } 
      if (currentColumn === newPositionCol) {
        isSafeSpace = false
      }
    }
  }); 
  return isSafeSpace
}

/**
 * Checks if the board state represents a complete solution
 * (all N queens are placed).
 */
export function isComplete(boardState: BoardState): boolean {

  let boardComplete = false; 
  const n = size(boardState);
  let count = 0;

  boardState.forEach((element) => {
    if (element !== -1) {
      count += 1;
    }
  });

  if (n === count) {
    boardComplete = true
  }
  return boardComplete
}

/**
 * Returns a new board state rotated 90 degrees clockwise.
 * swap row and column first
 * formula n - 1 - row
 */
export function rotateBoard(boardState: BoardState): BoardState {
  
  const currentBoardState = cloneDeep(boardState);
  const n = size(currentBoardState);
  const newBoard = cloneDeep(currentBoardState)

  currentBoardState.forEach((currentColumn, currentRow) => {

     if (currentColumn !== -1) {
        const newRow = cloneDeep(currentColumn)
        const oldRow = cloneDeep(currentRow)
        newBoard[newRow] = ((n - 1) - oldRow)
     }    

  });
  return newBoard
}

/**
 * Returns a new board state flipped horizontally.
 */
export function flipBoard(boardState: BoardState): BoardState {
  throw new Error("flipBoard not implemented");
}
