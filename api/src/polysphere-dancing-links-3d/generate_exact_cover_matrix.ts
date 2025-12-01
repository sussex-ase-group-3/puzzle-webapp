import { writeFileSync } from "fs";
import { getPiece } from "../polysphere/pieces.js";
import {
  rotateClockwise,
  flipHorizontal,
} from "../polysphere/board-operations.js";
import lodash from "lodash";
const { cloneDeep } = lodash;

// Pyramid structure:
// Layer 0 (bottom): 5x5 = 25 cells (indices 0-24)
// Layer 1: 4x4 = 16 cells (indices 25-40)
// Layer 2: 3x3 = 9 cells (indices 41-49)
// Layer 3: 2x2 = 4 cells (indices 50-53)
// Layer 4 (top): 1x1 = 1 cell (index 54)

const PYRAMID_LAYERS = [
  { size: 5, startIndex: 0 }, // 25 cells: 0-24
  { size: 4, startIndex: 25 }, // 16 cells: 25-40
  { size: 3, startIndex: 41 }, // 9 cells: 41-49
  { size: 2, startIndex: 50 }, // 4 cells: 50-53
  { size: 1, startIndex: 54 }, // 1 cell: 54
];

function generateOrientations(shape: boolean[][]): boolean[][][] {
  const uniqueShapes: boolean[][][] = [];
  const seen = new Set<string>();

  for (let flipped = 0; flipped < 2; flipped++) {
    for (let rotations = 0; rotations < 4; rotations++) {
      let currentShape = cloneDeep(shape);

      if (flipped === 1) {
        currentShape = flipHorizontal(currentShape);
      }

      for (let r = 0; r < rotations; r++) {
        currentShape = rotateClockwise(currentShape);
      }

      const shapeKey = currentShape
        .map((row) => row.map((cell) => (cell ? "1" : "0")).join(""))
        .join("|");

      if (!seen.has(shapeKey)) {
        seen.add(shapeKey);
        uniqueShapes.push(cloneDeep(currentShape));
      }
    }
  }

  return uniqueShapes;
}

/**
 * Convert pyramid coordinates (layer, row, col) to linear cell index
 */
function pyramidToIndex(layer: number, row: number, col: number): number {
  if (layer < 0 || layer >= PYRAMID_LAYERS.length) {
    return -1;
  }

  const layerInfo = PYRAMID_LAYERS[layer];
  if (row < 0 || row >= layerInfo.size || col < 0 || col >= layerInfo.size) {
    return -1;
  }

  return layerInfo.startIndex + row * layerInfo.size + col;
}

/**
 * Check if a 2D shape can be placed in XY orientation (flat on a single layer)
 */
function canPlaceXY(
  shape: boolean[][],
  layer: number,
  row: number,
  col: number,
): boolean {
  const layerSize = PYRAMID_LAYERS[layer]?.size;
  if (!layerSize) return false;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const pyramidRow = row + r;
        const pyramidCol = col + c;
        if (
          pyramidRow < 0 ||
          pyramidCol < 0 ||
          pyramidRow >= layerSize ||
          pyramidCol >= layerSize
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Check if a 2D shape can be placed in XZ orientation
 * (rows span layers, cols are X coordinates, position parameter is Y coordinate)
 */
function canPlaceXZ(
  shape: boolean[][],
  startLayer: number,
  yPos: number,
  xPos: number,
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const layer = startLayer + r;
        const x = xPos + c;
        const y = yPos;

        if (layer < 0 || layer >= PYRAMID_LAYERS.length) {
          return false;
        }

        const layerSize = PYRAMID_LAYERS[layer].size;
        if (y < 0 || x < 0 || y >= layerSize || x >= layerSize) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Check if a 2D shape can be placed in YZ orientation
 * (cols span layers, rows are X coordinates, Y coordinate is fixed)
 */
function canPlaceYZ(
  shape: boolean[][],
  startLayer: number,
  xPos: number,
  yPos: number,
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const layer = startLayer + c;
        const x = xPos + r;
        const y = yPos;

        if (layer < 0 || layer >= PYRAMID_LAYERS.length) {
          return false;
        }

        const layerSize = PYRAMID_LAYERS[layer].size;
        if (x < 0 || y < 0 || x >= layerSize || y >= layerSize) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Get all cell indices occupied by an XY placement
 */
function getXYCells(
  shape: boolean[][],
  layer: number,
  row: number,
  col: number,
): number[] {
  const cells: number[] = [];
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const cellIndex = pyramidToIndex(layer, row + r, col + c);
        if (cellIndex >= 0) {
          cells.push(cellIndex);
        }
      }
    }
  }
  return cells;
}

/**
 * Get all cell indices occupied by an XZ placement
 */
function getXZCells(
  shape: boolean[][],
  startLayer: number,
  yPos: number,
  xPos: number,
): number[] {
  const cells: number[] = [];
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const cellIndex = pyramidToIndex(startLayer + r, yPos, xPos + c);
        if (cellIndex >= 0) {
          cells.push(cellIndex);
        }
      }
    }
  }
  return cells;
}

/**
 * Get all cell indices occupied by a YZ placement
 */
function getYZCells(
  shape: boolean[][],
  startLayer: number,
  xPos: number,
  yPos: number,
): number[] {
  const cells: number[] = [];
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const cellIndex = pyramidToIndex(startLayer + c, xPos + r, yPos);
        if (cellIndex >= 0) {
          cells.push(cellIndex);
        }
      }
    }
  }
  return cells;
}

function generateMatrix() {
  const placements: Array<{
    pieceId: number;
    position: [number, number, number]; // Depends on orientation type
    orientationIndex: number;
    orientationType: "XY" | "XZ" | "YZ";
  }> = [];

  // Generate all placements
  for (let pieceId = 1; pieceId <= 12; pieceId++) {
    const piece = getPiece(pieceId);
    const orientations = generateOrientations(piece.shape);

    orientations.forEach((shape, orientationIndex) => {
      // XY placements - flat on pyramid layers
      for (let layer = 0; layer < PYRAMID_LAYERS.length; layer++) {
        const layerSize = PYRAMID_LAYERS[layer].size;
        for (let row = 0; row < layerSize; row++) {
          for (let col = 0; col < layerSize; col++) {
            if (canPlaceXY(shape, layer, row, col)) {
              placements.push({
                pieceId,
                position: [layer, row, col],
                orientationIndex,
                orientationType: "XY",
              });
            }
          }
        }
      }

      // XZ placements - rows span layers, cols are X coordinates
      for (
        let startLayer = 0;
        startLayer < PYRAMID_LAYERS.length;
        startLayer++
      ) {
        const maxPos = PYRAMID_LAYERS[startLayer].size;
        for (let yPos = 0; yPos < maxPos; yPos++) {
          for (let xPos = 0; xPos < maxPos; xPos++) {
            if (canPlaceXZ(shape, startLayer, yPos, xPos)) {
              placements.push({
                pieceId,
                position: [startLayer, yPos, xPos],
                orientationIndex,
                orientationType: "XZ",
              });
            }
          }
        }
      }

      // YZ placements - rows span layers, cols are Y coordinates
      for (
        let startLayer = 0;
        startLayer < PYRAMID_LAYERS.length;
        startLayer++
      ) {
        const maxPos = PYRAMID_LAYERS[startLayer].size;
        for (let xPos = 0; xPos < maxPos; xPos++) {
          for (let yPos = 0; yPos < maxPos; yPos++) {
            if (canPlaceYZ(shape, startLayer, xPos, yPos)) {
              placements.push({
                pieceId,
                position: [startLayer, xPos, yPos],
                orientationIndex,
                orientationType: "YZ",
              });
            }
          }
        }
      }
    });
  }

  // Create matrix
  const matrix: number[][] = [];
  for (const placement of placements) {
    const row = new Array(67).fill(0); // 55 cells + 12 pieces
    const { pieceId, position, orientationIndex, orientationType } = placement;

    // Get shape for this placement
    const piece = getPiece(pieceId);
    const orientations = generateOrientations(piece.shape);
    const shape = orientations[orientationIndex];

    // Mark cells covered based on orientation type
    let occupiedCells: number[];
    if (orientationType === "XY") {
      const [layer, row, col] = position;
      occupiedCells = getXYCells(shape, layer, row, col);
    } else if (orientationType === "XZ") {
      const [startLayer, yPos, xPos] = position;
      occupiedCells = getXZCells(shape, startLayer, yPos, xPos);
    } else {
      // YZ
      const [startLayer, xPos, yPos] = position;
      occupiedCells = getYZCells(shape, startLayer, xPos, yPos);
    }

    for (const cellIndex of occupiedCells) {
      if (cellIndex >= 0 && cellIndex < 55) {
        row[cellIndex] = 1;
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

console.log(
  "Generating 3D pyramid polysphere exact cover matrix with full 3D orientations...",
);
const { matrix, columnNames, placements } = generateMatrix();

const data = {
  matrix,
  columnNames,
  placements,
  pyramidInfo: {
    layers: PYRAMID_LAYERS,
    totalCells: 55,
    description:
      "5x5 + 4x4 + 3x3 + 2x2 + 1x1 pyramid with XY, XZ, YZ orientations",
  },
  stats: {
    rows: matrix.length,
    columns: matrix[0].length,
    sparsity: `${(((matrix.length * matrix[0].length - matrix.flat().filter((x) => x === 1).length) / (matrix.length * matrix[0].length)) * 100).toFixed(1)}%`,
  },
};

writeFileSync(
  "./polysphere_exact_cover_matrix.json",
  JSON.stringify(data, null, 2),
);
console.log(
  `Saved ${matrix.length}×${matrix[0].length} matrix to polysphere_exact_cover_matrix.json`,
);
console.log(`Total placements: ${placements.length}`);
console.log(
  `XY placements: ${placements.filter((p) => p.orientationType === "XY").length}`,
);
console.log(
  `XZ placements: ${placements.filter((p) => p.orientationType === "XZ").length}`,
);
console.log(
  `YZ placements: ${placements.filter((p) => p.orientationType === "YZ").length}`,
);
