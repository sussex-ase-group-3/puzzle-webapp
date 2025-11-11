import { writeFileSync } from "fs";
import { getPiece } from "../polysphere/pieces.js";
import {
  rotateClockwise,
  flipHorizontal,
} from "../polysphere/board-operations.js";
import lodash from "lodash";
const { cloneDeep } = lodash;

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

function canPlaceAt(shape: boolean[][], row: number, col: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const boardRow = row + r;
        const boardCol = col + c;
        if (boardRow < 0 || boardCol < 0 || boardRow >= 5 || boardCol >= 11) {
          return false;
        }
      }
    }
  }
  return true;
}

function generateMatrix() {
  const placements: Array<{
    pieceId: number;
    position: [number, number];
    orientationIndex: number;
  }> = [];

  // Generate all placements
  for (let pieceId = 1; pieceId <= 12; pieceId++) {
    const piece = getPiece(pieceId);
    const orientations = generateOrientations(piece.shape);

    orientations.forEach((shape, orientationIndex) => {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 11; col++) {
          if (canPlaceAt(shape, row, col)) {
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

  // Create matrix
  const matrix: number[][] = [];
  for (const placement of placements) {
    const row = new Array(67).fill(0); // 55 cells + 12 pieces
    const { pieceId, position, orientationIndex } = placement;
    const [startRow, startCol] = position;

    // Get shape for this placement
    const piece = getPiece(pieceId);
    const orientations = generateOrientations(piece.shape);
    const shape = orientations[orientationIndex];

    // Mark cells covered
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const cellIndex = (startRow + r) * 11 + (startCol + c);
          row[cellIndex] = 1;
        }
      }
    }

    // Mark piece used
    row[55 + pieceId - 1] = 1;
    matrix.push(row);
  }

  // Column names
  const columnNames = [
    ...Array.from({ length: 55 }, (_, i) => `C${i + 1}`),
    ...Array.from({ length: 12 }, (_, i) => `P${i + 1}`),
  ];

  return { matrix, columnNames, placements };
}

console.log("Generating polysphere exact cover matrix...");
const { matrix, columnNames, placements } = generateMatrix();

const data = {
  matrix,
  columnNames,
  placements,
  stats: {
    rows: matrix.length,
    columns: matrix[0].length,
    sparsity: `${(((matrix.length * matrix[0].length - matrix.flat().filter((x) => x === 1).length) / (matrix.length * matrix[0].length)) * 100).toFixed(1)}%`,
  },
};

writeFileSync(
  "polysphere_exact_cover_matrix.json",
  JSON.stringify(data, null, 2),
);
console.log(
  `Saved ${matrix.length}×${matrix[0].length} matrix to polysphere_exact_cover_matrix.json`,
);
