import { getPiece } from "./pieces.js"
import { Board, PuzzleState, Piece, Position } from "./types.js";
import { getPieceBoundingBoxArea } from "./pieces.js";
import lodash from "lodash";
const { cloneDeep, size } = lodash;

/**
 * Creates an empty 5x11 board filled with zeros
 * @returns {Board} A new empty board
 */
export function selectNextPiece(remainingPieces: Set<number>): number {
  if (remainingPieces.size === 0) {
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
//rotate a piece 90d clockwise
function rotateMatrix(matrix: boolean[][]): boolean[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: boolean[][] = Array.from({ length: cols }, () => Array(rows).fill(false));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
}
//flip a piece horizontally
function flipMatrix(matrix: boolean[][]): boolean[][] {
  return matrix.map(row => [...row].reverse());
}


export function placePiece(
  state: PuzzleState,
  pieceId: number,
  rotations: number,
  flipped: boolean,
  position: Position,
): PuzzleState {
  const piece = getPiece(pieceId);
  let shape = piece.shape;

  //rotations(% 4 rotations)
  for (let i = 0; i < rotations % 4; i++) {
    shape = rotateMatrix(shape);
  }

  //if needed horizontal flip
  if (flipped) {
    shape = flipMatrix(shape);
  }

  const [startRow, startCol] = position;
  const newBoard = state.board.map(row => [...row]); // deep copy

  //Validate placement
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (!shape[r][c]) continue;

      const boardRow = startRow + r;
      const boardCol = startCol + c;

      if (
        boardRow < 0 ||
        boardCol < 0 ||
        boardRow >= newBoard.length ||
        boardCol >= newBoard[0].length
      ) {
        throw new Error("Piece placement out of bounds");
      }

      if (newBoard[boardRow][boardCol] !== 0) {
        throw new Error("Cannot place piece on occupied cell");
      }
    }
  }

  //Place piece
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        newBoard[startRow + r][startCol + c] = pieceId;
      }
    }
  }
  const newRemaining = new Set(state.remainingPieces);
  newRemaining.delete(pieceId);

  return {
    board: newBoard,
    remainingPieces: newRemaining,
  };
}

export function flipHorizontal(shape: boolean[][]): boolean[][] {
  const rows = size(shape);
  const cols = size(shape[0]);
  const newShape = Array.from({ length: cols }, () => Array(rows).fill(false));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newShape[r][rows - 1 - c] = shape[r][c];
    }
  }

  return newShape
}

export function rotateClockwise(shape: boolean[][]): boolean[][] {
  const rows = size(shape);
  const cols = size(shape[0]);
  const newShape = Array.from({ length: cols }, () => Array(rows).fill(false));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newShape[c][rows - 1 - r] = shape[r][c];
    }
  }

  return newShape;
}

/**
 * Check if the puzzle is complete (all pieces have been placed and all board spaces occupied)
 * @param state Current puzzle state
 * @returns true if no pieces remain AND all board spaces are occupied, false otherwise
 */
export function isComplete(state: PuzzleState): boolean {
  const board = state.board;
  const hasZero = board.some(row => row.some(col => col === 0));

  return state.remainingPieces.size === 0 && !hasZero;
};

/**
 * Check if a piece can be placed at the specified position on the board
 * @param board Current board state
 * @param piece The piece to place
 * @param rotations Number of 90-degree clockwise rotations (0-3)
 * @param flipped Whether the piece should be horizontally flipped
 * @param position Position to place the piece at
 * @returns true if the piece can be placed, false otherwise
 */
export function canPlacePiece(
  board: Board,
  piece: Piece,
  rotations: number,
  flipped: boolean,
  position: Position,
): boolean {

  //copy just shape
  let shape = cloneDeep(piece.shape);
  //apply horizontal flip
  if (flipped) {
    shape = flipHorizontal(shape);
  };
  //apply rotations
  if (rotations < 0 || rotations > 3) {
    throw new Error("Rotations request is out of bound")
  };
  for (let i = 0; i < rotations; i++) {
    shape = rotateClockwise(shape);
  };

  //check if piece fits on the board
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[0].length; col++) {

      if (shape[row][col] === true) {
        const currentRowPosition = position[0] + row;
        const currentColumnPosition = position[1] + col;

        if (currentRowPosition >= board.length ||
          currentRowPosition < 0 ||
          currentColumnPosition >= board[0].length ||
          currentColumnPosition < 0
        ) {
          return false;
        }
        if (board[currentRowPosition][currentColumnPosition] !== 0) {
          return false;
        };
      };
    };
  };
  return true;
};
