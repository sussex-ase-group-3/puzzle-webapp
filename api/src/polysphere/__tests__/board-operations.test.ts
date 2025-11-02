import { describe, test, expect } from "vitest";
import { selectNextPiece } from "../board-operations.js";
import { isComplete, createEmptyBoard } from "../board-operations.js";
import { PuzzleState } from "../types.js";

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
});

describe("Board Operations", () => {
  describe("isComplete", () => {
    test("should return true when no pieces remain and no remaining space", () => {
      const board = createEmptyBoard();
      // Fill entire board with piece IDs (no empty spaces)
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 11; col++) {
          board[row][col] = 1; // Any non-zero piece ID
        }
      }

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
        }
      }

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
});
