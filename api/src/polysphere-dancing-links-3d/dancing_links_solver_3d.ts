import lodash from "lodash";
import { readFileSync } from "fs";
import { join } from "path";
import { getPiece } from "../polysphere/pieces.js";
import {
  rotateClockwise,
  flipHorizontal,
} from "../polysphere/board-operations.js";

const { cloneDeep } = lodash;

export type PyramidBoard = number[][][]; // [layer][row][col]

export interface Poly3DPuzzleState {
  board: PyramidBoard;
  remainingPieces: Set<number>;
}

export interface Poly3DPlacement {
  pieceId: number;
  position: [number, number, number]; // Depends on orientation type
  orientationIndex: number;
  orientationType: "XY" | "XZ" | "YZ";
}

interface DLXStats {
  solutions: number;
  calls: number;
}

class DLXNode {
  left: DLXNode;
  right: DLXNode;
  up: DLXNode;
  down: DLXNode;
  column: ColumnHeader | null;
  rowId: number;

  constructor(column: ColumnHeader | null = null, rowId: number = -1) {
    this.left = this;
    this.right = this;
    this.up = this;
    this.down = this;
    this.column = column;
    this.rowId = rowId;
  }
}

class ColumnHeader extends DLXNode {
  size: number;
  name: string;

  constructor(name: string = "") {
    super();
    this.size = 0;
    this.name = name;
  }
}

class DancingLinks3DSolver {
  private header: ColumnHeader;
  private solution: number[];
  private stats: DLXStats = {
    solutions: 0,
    calls: 0,
  };
  private matrix: number[][];
  private placements: Poly3DPlacement[];
  private ALL_PIECE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  constructor(matrix: number[][], placements: Poly3DPlacement[]) {
    this.matrix = matrix;
    this.placements = placements;
    this.header = new ColumnHeader("header");
    this.solution = [];
    this.buildDLXStructure();
  }

  private buildDLXStructure() {
    const rows = this.matrix.length;
    const cols = this.matrix[0].length;

    // Create column headers
    const header = this.header;
    const columnHeaders: ColumnHeader[] = [];

    for (let col = 0; col < cols; col++) {
      const columnHeader = new ColumnHeader(`C${col}`);
      columnHeaders.push(columnHeader);

      // Link column header to main header row
      let prev = header.left;
      prev.right = columnHeader;
      columnHeader.left = prev;
      columnHeader.right = header;
      header.left = columnHeader;
    }

    // Create matrix nodes
    for (let row = 0; row < rows; row++) {
      let first: DLXNode | null = null;

      for (let col = 0; col < cols; col++) {
        if (this.matrix[row][col] === 1) {
          const node = new DLXNode(columnHeaders[col], row);
          columnHeaders[col].size++;

          // Link vertically
          const up = columnHeaders[col].up;
          up.down = node;
          node.up = up;
          node.down = columnHeaders[col];
          columnHeaders[col].up = node;

          // Link horizontally
          if (first === null) {
            first = node;
            node.left = node;
            node.right = node;
          } else {
            const left = first.left;
            left.right = node;
            node.left = left;
            node.right = first;
            first.left = node;
          }
        }
      }
    }
  }

  private cover(columnHeader: ColumnHeader) {
    columnHeader.right.left = columnHeader.left;
    columnHeader.left.right = columnHeader.right;

    for (let i = columnHeader.down; i !== columnHeader; i = i.down) {
      for (let j = i.right; j !== i; j = j.right) {
        j.down.up = j.up;
        j.up.down = j.down;
        if (j.column) {
          j.column.size--;
        }
      }
    }
  }

  private uncover(columnHeader: ColumnHeader) {
    for (let i = columnHeader.up; i !== columnHeader; i = i.up) {
      for (let j = i.left; j !== i; j = j.left) {
        if (j.column) {
          j.column.size++;
        }
        j.down.up = j;
        j.up.down = j;
      }
    }
    columnHeader.right.left = columnHeader;
    columnHeader.left.right = columnHeader;
  }

  private chooseColumn(): ColumnHeader | null {
    let bestCol: ColumnHeader | null = null;
    let minSize = Infinity;

    for (let col = this.header.right; col !== this.header; col = col.right) {
      if ((col as ColumnHeader).size < minSize) {
        bestCol = col as ColumnHeader;
        minSize = (col as ColumnHeader).size;
      }
    }

    return bestCol;
  }

  private *search(): Generator<number[]> {
    this.stats.calls++;

    if (this.header.right === this.header) {
      yield [...this.solution];
      this.stats.solutions++;
      return;
    }

    const col = this.chooseColumn();
    if (!col || col.size === 0) {
      return;
    }

    this.cover(col);

    for (let r = col.down; r !== col; r = r.down) {
      this.solution.push(r.rowId);

      for (let j = r.right; j !== r; j = j.right) {
        if (j.column) {
          this.cover(j.column);
        }
      }

      yield* this.search();

      // Backtrack
      this.solution.pop();
      for (let j = r.left; j !== r; j = j.left) {
        if (j.column) {
          this.uncover(j.column);
        }
      }
    }

    this.uncover(col);
  }

  *solve(): Generator<Poly3DPuzzleState> {
    for (const solutionRows of this.search()) {
      const board = this.createEmptyPyramidBoard();
      const usedPieces = new Set<number>();

      for (const rowIndex of solutionRows) {
        const placement = this.placements[rowIndex];
        this.applyPlacementToBoard(board, placement);
        usedPieces.add(placement.pieceId);
      }

      const remainingPieces = new Set(
        this.ALL_PIECE_IDS.filter(id => !usedPieces.has(id))
      );

      yield {
        board,
        remainingPieces,
      };
    }
  }

  private createEmptyPyramidBoard(): PyramidBoard {
    return [
      Array(5).fill(null).map(() => Array(5).fill(0)), // Layer 0: 5x5
      Array(4).fill(null).map(() => Array(4).fill(0)), // Layer 1: 4x4
      Array(3).fill(null).map(() => Array(3).fill(0)), // Layer 2: 3x3
      Array(2).fill(null).map(() => Array(2).fill(0)), // Layer 3: 2x2
      [[0]], // Layer 4: 1x1
    ];
  }

  private applyPlacementToBoard(board: PyramidBoard, placement: Poly3DPlacement) {
    const piece = getPiece(placement.pieceId);
    const orientations = this.generateOrientations(piece.shape);
    const shape = orientations[placement.orientationIndex];

    if (placement.orientationType === "XY") {
      const [layer, row, col] = placement.position;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
          if (shape[r][c] && board[layer] && board[layer][row + r]) {
            board[layer][row + r][col + c] = placement.pieceId;
          }
        }
      }
    } else if (placement.orientationType === "XZ") {
      const [startLayer, yPos, xPos] = placement.position;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
          if (shape[r][c] && board[startLayer + r] && board[startLayer + r][yPos]) {
            board[startLayer + r][yPos][xPos + c] = placement.pieceId;
          }
        }
      }
    } else { // YZ
      const [startLayer, xPos, yPos] = placement.position;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
          if (shape[r][c] && board[startLayer + c] && board[startLayer + c][xPos + r]) {
            board[startLayer + c][xPos + r][yPos] = placement.pieceId;
          }
        }
      }
    }
  }

  private generateOrientations(shape: boolean[][]): boolean[][][] {
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
}

export function* solve3D(
  initialState: Poly3DPuzzleState
): Generator<Poly3DPuzzleState> {
  let matrixData;
  
  try {
    const matrixPath = join(__dirname, "polysphere_exact_cover_matrix.json");
    const fileContent = readFileSync(matrixPath, "utf8");
    matrixData = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(
      "3D matrix file not found. Run generate_exact_cover_matrix.ts first."
    );
  }

  const { matrix, placements } = matrixData;

  // Filter matrix for partial board if needed
  const { filteredMatrix, filteredPlacements } = filterMatrixForPartial3DBoard(
    matrix,
    placements,
    initialState
  );

  const solver = new DancingLinks3DSolver(filteredMatrix, filteredPlacements);
  yield* solver.solve();
}

function filterMatrixForPartial3DBoard(
  matrix: number[][],
  placements: Poly3DPlacement[],
  initialState: Poly3DPuzzleState
): { filteredMatrix: number[][]; filteredPlacements: Poly3DPlacement[] } {
  const { board, remainingPieces } = initialState;

  // Find occupied cells
  const occupiedCells = new Set<number>();
  const usedPieces = new Set<number>();

  // Convert 3D board to linear indices
  const PYRAMID_LAYERS = [
    { size: 5, startIndex: 0 }, // 25 cells: 0-24
    { size: 4, startIndex: 25 }, // 16 cells: 25-40
    { size: 3, startIndex: 41 }, // 9 cells: 41-49
    { size: 2, startIndex: 50 }, // 4 cells: 50-53
    { size: 1, startIndex: 54 }, // 1 cell: 54
  ];

  for (let layer = 0; layer < board.length; layer++) {
    for (let row = 0; row < board[layer].length; row++) {
      for (let col = 0; col < board[layer][row].length; col++) {
        const pieceId = board[layer][row][col];
        if (pieceId !== 0) {
          const cellIndex = PYRAMID_LAYERS[layer].startIndex + row * PYRAMID_LAYERS[layer].size + col;
          occupiedCells.add(cellIndex);
          usedPieces.add(pieceId);
        }
      }
    }
  }

  // Filter valid placements
  const validPlacements: number[] = [];

  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i];

    // Skip if piece is already used or not in remaining pieces
    if (usedPieces.has(placement.pieceId) || 
        !remainingPieces.has(placement.pieceId)) {
      continue;
    }

    // Check if placement conflicts with occupied cells
    const row = matrix[i];
    let conflicts = false;

    for (let cellIndex = 0; cellIndex < 55; cellIndex++) {
      if (row[cellIndex] === 1 && occupiedCells.has(cellIndex)) {
        conflicts = true;
        break;
      }
    }

    if (!conflicts) {
      validPlacements.push(i);
    }
  }

  // Create filtered matrix
  const filteredMatrix: number[][] = [];
  const filteredPlacements: Poly3DPlacement[] = [];

  for (const placementIndex of validPlacements) {
    const originalRow = matrix[placementIndex];
    const newRow = [...originalRow];

    // Mark occupied cells as satisfied
    for (const cellIndex of occupiedCells) {
      newRow[cellIndex] = 0;
    }

    // Mark used pieces as satisfied
    for (const pieceId of usedPieces) {
      newRow[55 + pieceId - 1] = 0;
    }

    filteredMatrix.push(newRow);
    filteredPlacements.push(placements[placementIndex]);
  }

  return { filteredMatrix, filteredPlacements };
}

export function createEmpty3DBoard(): PyramidBoard {
  return [
    Array(5).fill(null).map(() => Array(5).fill(0)), // Layer 0: 5x5
    Array(4).fill(null).map(() => Array(4).fill(0)), // Layer 1: 4x4
    Array(3).fill(null).map(() => Array(3).fill(0)), // Layer 2: 3x3
    Array(2).fill(null).map(() => Array(2).fill(0)), // Layer 3: 2x2
    [[0]], // Layer 4: 1x1
  ];
}

export function piecesPresent3D(board: PyramidBoard): number[] {
  const pieces = new Set<number>();
  
  for (let layer = 0; layer < board.length; layer++) {
    for (let row = 0; row < board[layer].length; row++) {
      for (let col = 0; col < board[layer][row].length; col++) {
        const