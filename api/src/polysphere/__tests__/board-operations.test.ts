import { describe, test, expect } from "vitest";
import { selectNextPiece } from "../board-operations.js";
import { isComplete, createEmptyBoard, canPlacePiece } from "../board-operations.js";
import { PuzzleState } from "../types.js";
import { getPiece } from "../pieces.js";

describe("Board Operations", () => {
  describe("selectNextPiece", () => {
    test("should throw error when no pieces remain", () => {
      const remainingPieces = new Set([]);

      expect(() => selectNextPiece(remainingPieces)).toThrowError();
    });

    test("should return the single remaining piece", () => {
      const remainingPieces = new Set([7]);

      expect(selectNextPiece(remainingPieces)).toBe(7);
    });

    test("should return piece with largest bounding box area regardless of order", () => {
      // Piece 1: 3x2 = 6 area, Piece 5: 4x2 = 8 area (largest), Piece 11: 2x2 = 4 area
      // Test all 6 permutations to ensure function doesn't depend on iteration order
      expect(selectNextPiece(new Set([1, 5, 11]))).toBe(5);
      expect(selectNextPiece(new Set([1, 11, 5]))).toBe(5);
      expect(selectNextPiece(new Set([5, 1, 11]))).toBe(5);
      expect(selectNextPiece(new Set([5, 11, 1]))).toBe(5);
      expect(selectNextPiece(new Set([11, 1, 5]))).toBe(5);
      expect(selectNextPiece(new Set([11, 5, 1]))).toBe(5);
    });
  });

  describe("isComplete", () => {
    test("should return true when no pieces remain and no remaining space", () => {
      const board = createEmptyBoard();
      // Fill entire board with piece IDs (no empty spaces)
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 11; col++) {
          board[row][col] = 1; // Any non-zero piece ID
        };
      };

      const state: PuzzleState = {
        board,
        remainingPieces: new Set([]),
      };

      expect(isComplete(state)).toBe(true);
    });

    test("should return false when pieces remain and remaining space exists", () => {
      const state: PuzzleState = {
        board: createEmptyBoard(),
        remainingPieces: new Set([1, 2, 3]),
      };

      expect(isComplete(state)).toBe(false);
    });

    test("should return false when pieces remain but no remaining space", () => {
      const board = createEmptyBoard();
      // Fill entire board
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 11; col++) {
          board[row][col] = 1;
        };
      };

      const state: PuzzleState = {
        board,
        remainingPieces: new Set([5, 7]), // Pieces remain but board is full
      };

      expect(isComplete(state)).toBe(false);
    });

    test("should return false when no pieces remain but remaining space exists", () => {
      const board = createEmptyBoard();
      board[0][0] = 1;
      board[2][3] = 5;
      board[4][10] = 12;
      // Board still has many empty spaces (0 values)

      const state: PuzzleState = {
        board,
        remainingPieces: new Set([]),
      };

      expect(isComplete(state)).toBe(false);
    });
  });

  describe("canPlacePiece", () => {
    test("should return true for valid placements", () => {
      const board = createEmptyBoard();

      expect(canPlacePiece(board, getPiece(1), 0, false, [1, 1])).toBe(true);
      expect(canPlacePiece(board, getPiece(10), 0, false, [1, 2])).toBe(true);
      expect(canPlacePiece(board, getPiece(11), 0, false, [3, 9])).toBe(true); // exact boundary fit
      expect(canPlacePiece(board, getPiece(10), 1, false, [1, 1])).toBe(true); // 90° rotation fits
      expect(canPlacePiece(board, getPiece(2), 0, true, [1, 1])).toBe(true); // flipped asymmetric piece
      expect(canPlacePiece(board, getPiece(3), 2, true, [1, 1])).toBe(true); // 180° rotation + flip
    });

    test("should return false for out of bounds placements", () => {
      const board = createEmptyBoard();

      expect(canPlacePiece(board, getPiece(5), 0, false, [0, 8])).toBe(false); // right edge
      expect(canPlacePiece(board, getPiece(10), 0, false, [4, 0])).toBe(false); // bottom edge
      expect(canPlacePiece(board, getPiece(11), 0, false, [3, 10])).toBe(false); // one cell beyond
      expect(canPlacePiece(board, getPiece(10), 1, false, [2, 1])).toBe(false); // rotated extends beyond
    });

    test("should return false for collisions with existing pieces", () => {
      const board = createEmptyBoard();
      board[1][1] = 5;
      board[1][2] = 5;

      expect(canPlacePiece(board, getPiece(1), 0, false, [1, 1])).toBe(false); // direct overlap
      expect(canPlacePiece(board, getPiece(2), 0, false, [1, 0])).toBe(false); // partial overlap
    });

    test("should return true when false cells overlap occupied areas", () => {
      const board = createEmptyBoard();
      board[2][1] = 1;

      // Piece 2 has false cells that can overlap occupied areas
      expect(canPlacePiece(board, getPiece(2), 0, false, [2, 0])).toBe(true);
    });

    test("should handle invalid rotation parameters", () => {
      const board = createEmptyBoard();

      expect(() => {
        canPlacePiece(board, getPiece(1), -1, false, [1, 1]);
      }).toThrowError();

      expect(() => {
        canPlacePiece(board, getPiece(1), 4, false, [1, 1]);
      }).toThrowError();
    });
  });
});
