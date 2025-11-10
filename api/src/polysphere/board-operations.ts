import { getPiece } from "./pieces.js";
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

  const largestShapeId = Array.from(remainingPieces).reduce(
    (largestBoundSoFarId, currentShapeId) => {
      const largestBound = getPieceBoundingBoxArea(
        getPiece(largestBoundSoFarId),
      );
      const currentBound = getPieceBoundingBoxArea(getPiece(currentShapeId));
      return currentBound > largestBound ? currentShapeId : largestBoundSoFarId;
    },
  );

  return largestShapeId;
}

/**
 * Creates an empty 5x11 board filled with zeros
 * @returns {Board} A new empty board
 */
export function createEmptyBoard(): Board {
  return Array(5)
    .fill(null)
    .map(() => Array(11).fill(0));
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

//flip a piece horizontally
export function flipHorizontal(shape: boolean[][]): boolean[][] {
  return shape.map((row) => [...row].reverse());
}

/**
 * Generate all unique orientations (rotations and reflections) of a piece
 * @param piece The piece to generate orientations for
 * @returns Array of all unique shapes (boolean matrices)
 */
function generateOrientations(piece: Piece): boolean[][][] {
  const uniqueShapes: boolean[][][] = [];
  const seen = new Set<string>();

  for (let flipped = 0; flipped < 2; flipped++) {
    for (let rotations = 0; rotations < 4; rotations++) {
      // Generate the shape for this orientation
      let shape = cloneDeep(piece.shape);

      if (flipped === 1) {
        shape = flipHorizontal(shape);
      }

      for (let i = 0; i < rotations; i++) {
        shape = rotateClockwise(shape);
      }

      // Create a string representation to check for duplicates
      const shapeStr = shape
        .map((row) => row.map((cell) => (cell ? "1" : "0")).join(""))
        .join("|");

      if (!seen.has(shapeStr)) {
        seen.add(shapeStr);
        uniqueShapes.push(shape);
      }
    }
  }

  return uniqueShapes;
}

export function placePiece(
  board: Board,
  pieceId: number,
  shape: boolean[][],
  position: Position,
): Board {
  const [startRow, startCol] = position;
  const newBoard = board.map((row) => [...row]);

  // Place the shape
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        newBoard[startRow + r][startCol + c] = pieceId;
      }
    }
  }

  return newBoard;
}

/**
 * Check if the puzzle is complete (all pieces have been placed and all board spaces occupied)
 * @param state Current puzzle state
 * @returns true if no pieces remain AND all board spaces are occupied, false otherwise
 */
export function isComplete(state: PuzzleState): boolean {
  const board = state.board;
  const hasZero = board.some((row) => row.some((col) => col === 0));

  return state.remainingPieces.size === 0 && !hasZero;
}

/**
 * Check if a piece can be placed at the specified position on the board
 * @param board Current board state
 * @param shape The shape to place (boolean matrix)
 * @param position Position to place the shape at [row, col]
 * @returns true if the shape can be placed without conflicts, false otherwise
 */
export function canPlacePiece(
  board: Board,
  shape: boolean[][],
  position: Position,
): boolean {
  const [startRow, startCol] = position;

  // Check if shape fits on the board
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[0].length; col++) {
      if (shape[row][col]) {
        const boardRow = startRow + row;
        const boardCol = startCol + col;

        if (
          boardRow < 0 ||
          boardCol < 0 ||
          boardRow >= board.length ||
          boardCol >= board[0].length
        ) {
          return false;
        }

        if (board[boardRow][boardCol] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Solve the polysphere puzzle using backtracking
 * @param state Current puzzle state
 * @yields Solutions as they are found
 */
export function* solve(state: PuzzleState): Generator<PuzzleState> {
  // Base case: if no pieces remain, check if the puzzle is complete
  if (state.remainingPieces.size === 0) {
    if (isComplete(state)) {
      yield state;
    }
    return;
  }

  // Select the next piece to place (largest by bounding box area)
  const nextPieceId = selectNextPiece(state.remainingPieces);
  const piece = getPiece(nextPieceId);

  // Generate all unique orientations for this piece
  const orientations = generateOrientations(piece);

  // Try placing the piece at every position on the board
  for (let row = 0; row < state.board.length; row++) {
    for (let col = 0; col < state.board[0].length; col++) {
      const position: Position = [row, col];

      // Try all orientations of the piece
      for (const shape of orientations) {
        // Check if this shape can be placed at this position
        if (canPlacePiece(state.board, shape, position)) {
          try {
            // Place the piece and get new state
            const newBoard = placePiece(
              state.board,
              nextPieceId,
              shape,
              position,
            );
            const newRemaining = new Set(state.remainingPieces);
            newRemaining.delete(nextPieceId);

            const newState = {
              board: newBoard,
              remainingPieces: newRemaining,
            };

            // Recursively solve with the new state
            yield* solve(newState);
          } catch (error) {
            // If placement fails for any reason, continue to next orientation
            continue;
          }
        }
      }
    }
  }

  // If we reach here, no valid placement was found for this piece
  // The generator will implicitly return (no more solutions from this branch)
}
