import { describe, test, expect } from "@jest/globals";
import { BoardState, Position } from "../types.js";
import {
  placeQueen,
  isSafe,
  isComplete,
  rotateBoard,
  flipBoard,
} from "../board-operations.js";

describe("Board Operations", () => {
  describe("placeQueen", () => {
    test("should place queen on empty board", () => {
      const emptyBoard: BoardState = [-1, -1, -1, -1];
      const position: Position = [0, 1];

      const result = placeQueen(emptyBoard, position);

      expect(result).toEqual([1, -1, -1, -1]);
    });

    test("should return new board state without mutating original", () => {
      const originalBoard: BoardState = [-1, -1, -1, -1];
      const boardCopy = [...originalBoard];
      const position: Position = [2, 3];

      const result = placeQueen(originalBoard, position);

      expect(originalBoard).toEqual(boardCopy); // Original unchanged
      expect(result).not.toBe(originalBoard); // Different reference
    });
  });

  describe("isSafe", () => {
    test("should return true for safe position", () => {
      const boardState: BoardState = [1, 3, -1, -1]; // Queens at (0,1) and (1,3)
      const safePosition: Position = [2, 0]; // Row 2, Column 0 - no conflicts

      const result = isSafe(boardState, safePosition);

      expect(result).toBe(true);
    });

    test("should return false for column conflict", () => {
      const boardState: BoardState = [1, -1, -1, -1]; // Queen at (0,1)
      const conflictPosition: Position = [2, 1]; // Same column as existing queen

      const result = isSafe(boardState, conflictPosition);

      expect(result).toBe(false);
    });

    test("should return false for diagonal conflict", () => {
      const boardState: BoardState = [1, -1, -1, -1]; // Queen at (0,1)
      const diagonalPosition: Position = [2, 3]; // Diagonal conflict with (0,1)

      const result = isSafe(boardState, diagonalPosition);

      expect(result).toBe(false);
    });
  });

  describe("isComplete", () => {
    test("should return false for empty board", () => {
      const emptyBoard: BoardState = [-1, -1, -1, -1];

      const result = isComplete(emptyBoard);

      expect(result).toBe(false);
    });

    test("should return true for completely filled board", () => {
      const completeBoard: BoardState = [1, 3, 0, 2]; // All positions filled

      const result = isComplete(completeBoard);

      expect(result).toBe(true);
    });
  });

  describe("rotateBoard", () => {
    test("should rotate 90 degrees clockwise", () => {
      const originalBoard: BoardState = [0, -1]; // 2x2 board with queen at (0,0)
      // Visual: Q .    After 90° clockwise:  . Q
      //         . .                          . .
      // Queen moves from (0,0) to (0,1)
      const expectedRotated: BoardState = [1, -1];

      const result = rotateBoard(originalBoard);

      expect(result).toEqual(expectedRotated);
    });

    test("should return new board state without mutating original", () => {
      const originalBoard: BoardState = [0, 1];
      const boardCopy = [...originalBoard];

      const result = rotateBoard(originalBoard);

      expect(originalBoard).toEqual(boardCopy); // Original unchanged
      expect(result).not.toBe(originalBoard); // Different reference
    });
  });

  describe("flipBoard", () => {
    test("should flip board horizontally", () => {
      const originalBoard: BoardState = [0, -1]; // 2x2 board with queen at (0,0)
      // Visual: Q .    After horizontal flip:  . Q
      //         . .                            . .
      // Queen moves from (0,0) to (0,1)
      const expectedFlipped: BoardState = [1, -1];

      const result = flipBoard(originalBoard);

      expect(result).toEqual(expectedFlipped);
    });

    test("should return new board state without mutating original", () => {
      const originalBoard: BoardState = [0, 1];
      const boardCopy = [...originalBoard];

      const result = flipBoard(originalBoard);

      expect(originalBoard).toEqual(boardCopy); // Original unchanged
      expect(result).not.toBe(originalBoard); // Different reference
    });
  });
});
