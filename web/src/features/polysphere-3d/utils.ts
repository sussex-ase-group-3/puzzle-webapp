// src/features/polysphere-3d/utils.ts
import type { PyramidBoard } from "./types";
import type { PieceId } from "../polysphere-core/pieceTypes";
import { ALL_PIECES } from "../polysphere-core/pieceTypes";
import {
  PIECE_SHAPES,
  toOffsets,
  type BoolGrid,
} from "../polysphere-core/pieces";

export const LAYERS = [5, 4, 3, 2, 1]; // size of each layer
export const ALL_PIECES_3D: PieceId[] = ALL_PIECES;

export function emptyPyramid(): PyramidBoard {
  return LAYERS.map((size) =>
    Array.from({ length: size }, () => Array.from({ length: size }, () => 0)),
  );
}

// Scan any 3D board and see which piece IDs are present
export function piecesPresent3D(board: PyramidBoard): Set<PieceId> {
  const s = new Set<PieceId>();
  board.forEach((layer) =>
    layer.forEach((row) =>
      row.forEach((v) => {
        if (v > 0) s.add(v);
      }),
    ),
  );
  return s;
}

export function remainingFromAllowed3D(
  allowed: PieceId[],
  board: PyramidBoard,
): PieceId[] {
  const present = piecesPresent3D(board);
  return allowed.filter((id) => !present.has(id));
}

/**
 * --- Orientation helpers for placing a piece in XY on a single layer ---
 */

// Rotate a BoolGrid 90° clockwise
function rotate90(shape: BoolGrid): BoolGrid {
  const rows = shape.length;
  const cols = shape[0].length;
  const out: BoolGrid = Array.from({ length: cols }, () =>
    Array<boolean>(rows).fill(false),
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape[r][c]) {
        out[c][rows - 1 - r] = true;
      }
    }
  }
  return out;
}

// Apply 0–3 quarter turns
function rotateShape(shape: BoolGrid, turns: 0 | 1 | 2 | 3): BoolGrid {
  let g = shape;
  for (let i = 0; i < turns; i++) {
    g = rotate90(g);
  }
  return g;
}

// Flip horizontally (mirror columns)
function flipShape(shape: BoolGrid): BoolGrid {
  return shape.map((row) => [...row].reverse());
}

/**
 * Get oriented [dr, dc] offsets for a piece given rotation + flip.
 * dr,dc are relative to an anchor cell; we normalise so min dr/min dc = 0.
 */
export function getOrientedOffsets(
  pieceId: PieceId,
  turns: 0 | 1 | 2 | 3,
  flip: boolean,
): [number, number][] {
  let shape = PIECE_SHAPES[pieceId];
  if (!shape || shape.length === 0) return [];

  if (flip) {
    shape = flipShape(shape);
  }
  shape = rotateShape(shape, turns);

  // toOffsets normalises to (0,0)-based offsets
  const offsets = toOffsets(shape);
  return offsets as [number, number][];
}

/**
 * Convert pyramid coordinates (layer, row, col) to linear cell index
 */
function pyramidToIndex(layer: number, row: number, col: number): number {
  if (layer < 0 || layer >= LAYERS.length) {
    return -1;
  }

  const layerSize = LAYERS[layer];
  if (row < 0 || row >= layerSize || col < 0 || col >= layerSize) {
    return -1;
  }

  let startIndex = 0;
  for (let i = 0; i < layer; i++) {
    startIndex += LAYERS[i] * LAYERS[i];
  }

  return startIndex + row * layerSize + col;
}

/**
 * Convert linear cell index to pyramid coordinates (layer, row, col)
 */
function indexToPyramid(index: number): [number, number, number] | null {
  let currentIndex = 0;

  for (let layer = 0; layer < LAYERS.length; layer++) {
    const layerSize = LAYERS[layer];
    const layerCells = layerSize * layerSize;

    if (index < currentIndex + layerCells) {
      const cellInLayer = index - currentIndex;
      const row = Math.floor(cellInLayer / layerSize);
      const col = cellInLayer % layerSize;
      return [layer, row, col];
    }

    currentIndex += layerCells;
  }

  return null;
}

/**
 * Get oriented shape from placement data (stored shape)
 */
function getOrientedShape(placement: any): BoolGrid {
  return placement.orientedShape || [];
}

/**
 * Place a piece on the pyramid board based on placement data
 */
function placePieceOnBoard(board: PyramidBoard, placement: any): void {
  const { pieceId, position, orientationType } = placement;
  const orientedShape = getOrientedShape(placement);

  if (orientationType === "XY") {
    // Flat placement on a single layer
    const [layer, startRow, startCol] = position;
    for (let r = 0; r < orientedShape.length; r++) {
      for (let c = 0; c < orientedShape[r].length; c++) {
        if (orientedShape[r][c]) {
          const boardRow = startRow + r;
          const boardCol = startCol + c;
          if (
            layer >= 0 &&
            layer < board.length &&
            boardRow >= 0 &&
            boardRow < board[layer].length &&
            boardCol >= 0 &&
            boardCol < board[layer][boardRow].length
          ) {
            board[layer][boardRow][boardCol] = pieceId;
          }
        }
      }
    }
  } else if (orientationType === "XZ") {
    // Vertical placement - rows span layers
    const [startLayer, yPos, xPos] = position;
    for (let r = 0; r < orientedShape.length; r++) {
      for (let c = 0; c < orientedShape[r].length; c++) {
        if (orientedShape[r][c]) {
          const layer = startLayer + r;
          const x = xPos + c;
          const y = yPos;
          if (
            layer >= 0 &&
            layer < board.length &&
            y >= 0 &&
            y < board[layer].length &&
            x >= 0 &&
            x < board[layer][y].length
          ) {
            board[layer][y][x] = pieceId;
          }
        }
      }
    }
  } else if (orientationType === "YZ") {
    // Vertical placement - cols span layers
    const [startLayer, xPos, yPos] = position;
    for (let r = 0; r < orientedShape.length; r++) {
      for (let c = 0; c < orientedShape[r].length; c++) {
        if (orientedShape[r][c]) {
          const layer = startLayer + c;
          const x = xPos + r;
          const y = yPos;
          if (
            layer >= 0 &&
            layer < board.length &&
            x >= 0 &&
            x < board[layer].length &&
            y >= 0 &&
            y < board[layer][x].length
          ) {
            board[layer][x][y] = pieceId;
          }
        }
      }
    }
  }
}

/**
 * Convert a dancing links solution to a PyramidBoard
 */
export function convertSolutionToBoard(solution: {
  rowIndices: number[];
  placements: any[];
}): PyramidBoard {
  const board = emptyPyramid();
  const { rowIndices, placements } = solution;

  rowIndices.forEach((rowIndex) => {
    const placement = placements[rowIndex];
    if (!placement) return;

    placePieceOnBoard(board, placement);
  });

  return board;
}
