import { describe, test, expect } from "vitest";
import {
  solveDancingLinks,
  validateSolution,
} from "../dancing_links_solver.js";
import { readFileSync } from "fs";
import { getPiece } from "../../polysphere/pieces.js";
import {
  rotateClockwise,
  flipHorizontal,
} from "../../polysphere/board-operations.js";
import { Board } from "../../polysphere/types.js";
import lodash from "lodash";
const { cloneDeep } = lodash;

// Small 3x3 matrix generation for testing
function generateOrientations(shape: boolean[][]): boolean[][][] {
  const uniqueShapes: boolean[][][] = [];
  const seen = new Set<string>();

  for (let flipped = 0; flipped < 2; flipped++) {
    for (let rotations = 0; rotations < 4; rotations++) {
      let currentShape = cloneDeep(shape);

      if (flipped === 1) {
        currentShape = flipHorizontal(currentShape);
      }

      for (let i = 0; i < rotations; i++) {
        currentShape = rotateClockwise(currentShape);
      }

      const shapeStr = currentShape
        .map((row) => row.map((cell) => (cell ? "1" : "0")).join(""))
        .join("|");

      if (!seen.has(shapeStr)) {
        seen.add(shapeStr);
        uniqueShapes.push(currentShape);
      }
    }
  }

  return uniqueShapes;
}

function canPlaceAt(
  shape: boolean[][],
  row: number,
  col: number,
  boardRows: number,
  boardCols: number,
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const boardRow = row + r;
        const boardCol = col + c;
        if (
          boardRow < 0 ||
          boardCol < 0 ||
          boardRow >= boardRows ||
          boardCol >= boardCols
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

function generateSmallMatrix(
  pieceIds: number[],
  boardRows: number,
  boardCols: number,
) {
  const placements: Array<{
    pieceId: number;
    position: [number, number];
    orientationIndex: number;
  }> = [];

  for (const pieceId of pieceIds) {
    const piece = getPiece(pieceId);
    const orientations = generateOrientations(piece.shape);

    orientations.forEach((shape, orientationIndex) => {
      for (let row = 0; row < boardRows; row++) {
        for (let col = 0; col < boardCols; col++) {
          if (canPlaceAt(shape, row, col, boardRows, boardCols)) {
            placements.push({
              pieceId,
              position: [row, col],
              orientationIndex,
            });
          }
        }
      }
    });
  }

  const numCells = boardRows * boardCols;
  const numColumns = numCells + pieceIds.length;
  const matrix: number[][] = [];

  for (const placement of placements) {
    const row = new Array(numColumns).fill(0);
    const { pieceId, position, orientationIndex } = placement;
    const [startRow, startCol] = position;

    const piece = getPiece(pieceId);
    const orientations = generateOrientations(piece.shape);
    const shape = orientations[orientationIndex];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const cellIndex = (startRow + r) * boardCols + (startCol + c);
          row[cellIndex] = 1;
        }
      }
    }

    const pieceIndex = pieceIds.indexOf(pieceId);
    row[numCells + pieceIndex] = 1;
    matrix.push(row);
  }

  return { matrix, placements };
}

function solutionToBoard(
  solution: number[],
  placements: any[],
  boardRows: number,
  boardCols: number,
): Board {
  const board: Board = Array(boardRows)
    .fill(null)
    .map(() => Array(boardCols).fill(0));

  for (const rowIndex of solution) {
    const placement = placements[rowIndex];
    const { pieceId, position, orientationIndex } = placement;
    const [startRow, startCol] = position;

    const piece = getPiece(pieceId);
    const orientations = generateOrientations(piece.shape);
    const shape = orientations[orientationIndex];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          board[startRow + r][startCol + c] = pieceId;
        }
      }
    }
  }

  return board;
}

describe("Dancing Links Exact Cover Solver", () => {
  test("should find 8 solutions with pieces 6 and 8 on 3x3 board (dancing links)", () => {
    const { matrix, placements } = generateSmallMatrix([6, 8], 3, 3);

    const solutions = solveDancingLinks(matrix);
    const solutionList = [];

    // Collect solutions with limit to avoid hanging
    let count = 0;
    for (const solution of solutions) {
      solutionList.push(solution);
      count++;
      if (count >= 10) break; // Safety limit
    }

    expect(solutionList.length).toBe(8);

    // Validate each solution
    solutionList.forEach((solution, index) => {
      expect(validateSolution(matrix, solution)).toBe(true);
      expect(solution.length).toBe(2); // Should use exactly 2 placements

      const board = solutionToBoard(solution, placements, 3, 3);

      // Count cells
      let piece6Count = 0;
      let piece8Count = 0;
      let emptyCount = 0;

      board.forEach((row) => {
        row.forEach((cell) => {
          if (cell === 0) emptyCount++;
          if (cell === 6) piece6Count++;
          if (cell === 8) piece8Count++;
        });
      });

      expect(emptyCount).toBe(0); // No empty cells
      expect(piece6Count).toBe(5); // Piece 6 has 5 cells
      expect(piece8Count).toBe(4); // Piece 8 has 4 cells
    });
  });

  test("should find first solution for full 12-piece puzzle (dancing links)", () => {
    let matrixData;
    try {
      const fileContent = readFileSync(
        "src/polysphere-dancing-links/polysphere_exact_cover_matrix.json",
        "utf8",
      );
      matrixData = JSON.parse(fileContent);
    } catch (error) {
      console.log("Matrix file not found, skipping full puzzle test");
      return;
    }

    const { matrix, placements } = matrixData;

    // Quick validation - matrix should be 2140x67
    expect(matrix.length).toBe(2140);
    expect(matrix[0].length).toBe(67);

    const startTime = Date.now();
    const solutions = solveDancingLinks(matrix);
    let firstSolution;

    // Get first solution
    for (const solution of solutions) {
      firstSolution = solution;
      break;
    }

    const endTime = Date.now();
    console.log(`First solution found in ${endTime - startTime}ms`);

    expect(firstSolution).toBeDefined();
    expect(firstSolution!.length).toBe(12); // 12 pieces
    expect(validateSolution(matrix, firstSolution!)).toBe(true);

    // Convert to board and validate
    const board = Array(5)
      .fill(null)
      .map(() => Array(11).fill(0));

    for (const rowIndex of firstSolution!) {
      const placement = placements[rowIndex];
      const { pieceId, position, orientationIndex } = placement;
      const [startRow, startCol] = position;

      const piece = getPiece(pieceId);
      const orientations = generateOrientations(piece.shape);
      const shape = orientations[orientationIndex];

      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
          if (shape[r][c]) {
            board[startRow + r][startCol + c] = pieceId;
          }
        }
      }
    }

    // Validate board is completely filled
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 11; col++) {
        expect(board[row][col]).toBeGreaterThan(0);
      }
    }

    // Validate all pieces used
    const usedPieces = new Set<number>();
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 11; col++) {
        const pieceId = board[row][col];
        expect(pieceId).toBeGreaterThanOrEqual(1);
        expect(pieceId).toBeLessThanOrEqual(12);
        usedPieces.add(pieceId);
      }
    }

    expect(usedPieces.size).toBe(12);
  });
});
