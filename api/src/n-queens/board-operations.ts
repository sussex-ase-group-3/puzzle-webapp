import { BoardState, Position } from "./types.js";
import  { cloneDeep, size }  from 'lodash';

/**
 * Function purpose: Places a queen at a specified position on the board.
 * Creates a deep copy of the board to ensure the original state is not
 * mutated.
 * @param {BoardState} boardState, current board state, idx is row & val is col
 * @param {Position} newPosition A read-only tuple `[row, column]`.
 * @returns {BoardState} A new board state with the queen placed.
 * @throws {Error} For out of bounds and if queen already exist in position
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
 * Function purpose: Checks if placing a queen at the specified position would be safe
 * (no conflicts with existing queens).
 * @param {BoardState} boardState, current board state, idx is row & val is col
 * @param {Position} newPosition A read-only tuple `[row, column]`.
 * @returns {boolean} A boolean value true for safe otherwise false.
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
 * Function purpose: Checks if the board state represents a complete solution
 * (all N queens are placed).
 * @param {BoardState} boardState, current board state, idx is row & val is col
 * @returns {boolean} A boolean value true for complete otherwise false.
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
 * Function purpose: To rotate board 90 degrees clockwise.
 * function swaps idx with col for new row, formula (n-1) - row for new col 
 * 
 * @param {BoardState} boardState, current board state, idx is row & val is col
 * @returns {BoardState} Returns a new board state rotated 90 degrees clockwise.
 */
export function rotateBoard(boardState: BoardState): BoardState {
  
  const currentBoardState = cloneDeep(boardState);
  const n = size(currentBoardState);
  const newBoard = cloneDeep(currentBoardState);

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
 * Function purpose: To flip current board horizontally.
 * row value stays the same, new column is calculated using formyla (n-1)-col
 * 
 * @param {BoardState} boardState, current board state, idx is row & val is col
 * @returns {BoardState} Returns a new board state flipped horizontally.
 */
export function flipBoard(boardState: BoardState): BoardState {

  const currentBoardState = cloneDeep(boardState);
  const newBoard = cloneDeep(boardState);
  const n = size(currentBoardState);

  currentBoardState.forEach((currentColumn, currentRow) => {

     if (currentColumn !== -1) {
        const newRow = cloneDeep(currentRow)
        const col = cloneDeep(currentColumn)
        newBoard[newRow] = ((n - 1) - col)
     }    

  });
  return newBoard

}
