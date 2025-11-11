/**
 * Dancing Links (DLX) implementation for exact cover problems
 * Based on Donald Knuth's Algorithm X with Dancing Links
 * Textbook implementation following Knuth's specifications exactly
 */

import { readFileSync } from "fs";
import { getPiece } from "../polysphere/pieces.js";
import {
  rotateClockwise,
  flipHorizontal,
} from "../polysphere/board-operations.js";
import lodash from "lodash";
const { cloneDeep } = lodash;

export type ExactCoverMatrix = number[][];

// Dancing Links Node
class DLXNode {
  left: DLXNode;
  right: DLXNode;
  up: DLXNode;
  down: DLXNode;
  column: ColumnHeader;
  rowId: number;

  constructor() {
    this.left = this;
    this.right = this;
    this.up = this;
    this.down = this;
    this.column = this as any; // Will be set properly during construction
    this.rowId = -1;
  }
}

// Column Header Node
class ColumnHeader extends DLXNode {
  size: number;
  name: string;

  constructor(name: string) {
    super();
    this.size = 0;
    this.name = name;
    this.column = this;
  }
}

/**
 * Dancing Links solver for exact cover problems
 */
export class DancingLinksSolver {
  private header: ColumnHeader;
  private solution: number[];

  constructor(matrix: ExactCoverMatrix) {
    this.solution = [];
    this.header = this.buildDLXStructure(matrix);
  }

  /**
   * Build the Dancing Links data structure from the matrix
   */
  private buildDLXStructure(matrix: ExactCoverMatrix): ColumnHeader {
    if (matrix.length === 0 || matrix[0].length === 0) {
      return new ColumnHeader("header");
    }

    const rows = matrix.length;
    const cols = matrix[0].length;

    // Create master header
    const header = new ColumnHeader("header");

    // Create column headers
    const columnHeaders: ColumnHeader[] = [];
    for (let j = 0; j < cols; j++) {
      const col = new ColumnHeader(`C${j}`);
      columnHeaders.push(col);

      // Link column header into header list
      col.left = header.left;
      col.right = header;
      header.left.right = col;
      header.left = col;
    }

    // Process each row
    for (let i = 0; i < rows; i++) {
      let prev: DLXNode | null = null;
      let first: DLXNode | null = null;

      // Create nodes for 1s in this row
      for (let j = 0; j < cols; j++) {
        if (matrix[i][j] === 1) {
          const node = new DLXNode();
          node.rowId = i;
          node.column = columnHeaders[j];

          // Link vertically into column
          node.down = columnHeaders[j];
          node.up = columnHeaders[j].up;
          columnHeaders[j].up.down = node;
          columnHeaders[j].up = node;
          columnHeaders[j].size++;

          // Link horizontally in row
          if (prev === null) {
            first = node;
            prev = node;
          } else {
            node.left = prev;
            prev.right = node;
            prev = node;
          }
        }
      }

      // Close the horizontal loop for this row
      if (first !== null && prev !== null) {
        first.left = prev;
        prev.right = first;
      }
    }

    return header;
  }

  /**
   * Cover operation - remove column and all rows that intersect it
   */
  private cover(col: ColumnHeader): void {
    // Remove column header from header list
    col.right.left = col.left;
    col.left.right = col.right;

    // For each row in this column
    let i = col.down;
    while (i !== col) {
      // For each node in this row (except the column node itself)
      let j = i.right;
      while (j !== i) {
        // Remove node from its column
        j.down.up = j.up;
        j.up.down = j.down;
        j.column.size--;
        j = j.right;
      }
      i = i.down;
    }
  }

  /**
   * Uncover operation - restore column and all rows that intersect it
   */
  private uncover(col: ColumnHeader): void {
    // For each row in this column (in reverse order)
    let i = col.up;
    while (i !== col) {
      // For each node in this row (in reverse order)
      let j = i.left;
      while (j !== i) {
        // Restore node to its column
        j.column.size++;
        j.down.up = j;
        j.up.down = j;
        j = j.left;
      }
      i = i.up;
    }

    // Restore column header to header list
    col.right.left = col;
    col.left.right = col;
  }

  /**
   * Choose column with minimum size (most constrained first heuristic)
   */
  private chooseColumn(): ColumnHeader | null {
    let bestCol: ColumnHeader | null = null;
    let minSize = Infinity;

    let col = this.header.right as ColumnHeader;
    while (col !== this.header) {
      if (col.size < minSize) {
        minSize = col.size;
        bestCol = col;
      }
      col = col.right as ColumnHeader;
    }

    return bestCol;
  }

  /**
   * Recursive search using Dancing Links Algorithm X
   */
  private *search(): Generator<number[]> {
    // If header points to itself, matrix is empty - we have a solution
    if (this.header.right === this.header) {
      yield [...this.solution];
      return;
    }

    // Choose a column to branch on
    const col = this.chooseColumn();
    if (!col) return;

    // If chosen column is empty, no solution in this branch
    if (col.size === 0) {
      return;
    }

    // Cover the chosen column
    this.cover(col);

    // Try each row in the chosen column
    let r = col.down;
    while (r !== col) {
      // Include this row in partial solution
      this.solution.push(r.rowId);

      // Cover all other columns in this row
      let j = r.right;
      while (j !== r) {
        this.cover(j.column);
        j = j.right;
      }

      // Recurse
      yield* this.search();

      // Backtrack: uncover all columns in this row (in reverse order)
      j = r.left;
      while (j !== r) {
        this.uncover(j.column);
        j = j.left;
      }

      // Remove row from partial solution
      this.solution.pop();

      r = r.down;
    }

    // Uncover the chosen column
    this.uncover(col);
  }

  /**
   * Solve and yield solutions one at a time
   */
  *solve(): Generator<number[]> {
    yield* this.search();
  }

  /**
   * Get first solution only
   */
  getFirstSolution(): number[] | null {
    const generator = this.solve();
    const result = generator.next();
    return result.done ? null : result.value;
  }
}

/**
 * Convenience function matching the interface
 */
export function* solveDancingLinks(
  matrix: ExactCoverMatrix,
): Generator<number[]> {
  const solver = new DancingLinksSolver(matrix);
  yield* solver.solve();
}

/**
 * Validate that a solution covers all columns exactly once
 */
export function validateSolution(
  matrix: ExactCoverMatrix,
  solution: number[],
): boolean {
  if (matrix.length === 0) return solution.length === 0;

  const numColumns = matrix[0].length;
  const columnCounts = new Array(numColumns).fill(0);

  for (const rowIndex of solution) {
    if (rowIndex < 0 || rowIndex >= matrix.length) return false;
    for (let col = 0; col < numColumns; col++) {
      if (matrix[rowIndex][col] === 1) {
        columnCounts[col]++;
      }
    }
  }

  return columnCounts.every((count) => count === 1);
}

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
 * Solve the polysphere puzzle using Dancing Links
 * Same interface as the original backtracking solver
 */
export function* solve(state: {
  board: number[][];
  remainingPieces: Set<number>;
}): Generator<{ board: number[][]; remainingPieces: Set<number> }> {
  // For empty board with all pieces, use pre-generated matrix
  const isEmpty = state.board.every((row) => row.every((cell) => cell === 0));
  const hasAllPieces = state.remainingPieces.size === 12;

  if (isEmpty && hasAllPieces) {
    // Load pre-generated matrix
    try {
      const fileContent = readFileSync(
        "./src/polysphere-dancing-links/polysphere_exact_cover_matrix.json",
        "utf8",
      );
      const data = JSON.parse(fileContent);
      const { matrix, placements } = data;

      // Solve using Dancing Links
      const solutions = solveDancingLinks(matrix);

      for (const solution of solutions) {
        // Convert solution to board format
        const board = Array(5)
          .fill(null)
          .map(() => Array(11).fill(0));

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
                const boardRow = startRow + r;
                const boardCol = startCol + c;
                board[boardRow][boardCol] = pieceId;
              }
            }
          }
        }

        yield {
          board,
          remainingPieces: new Set(),
        };
      }
    } catch (error) {
      console.error("Failed to load matrix data:", error);
      // If matrix loading fails, don't yield any solutions
      return;
    }
  } else {
    // For partial solutions, this Dancing Links solver doesn't handle them
    // The API should use the original backtracking solver for partial cases
    return;
  }
}

/**
 * Create an empty 5x11 polysphere board
 */
export function createEmptyBoard(): number[][] {
  return Array(5)
    .fill(null)
    .map(() => Array(11).fill(0));
}
