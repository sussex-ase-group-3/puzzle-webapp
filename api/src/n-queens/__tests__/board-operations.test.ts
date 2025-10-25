import { describe, test, expect } from "vitest";
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

    test("should not overwrite row with existing queen", () => {
      const originalBoard: BoardState = [1, -1, -1, -1];
      const position: Position = [0, 2];

      expect(() => placeQueen(originalBoard, position)).toThrowError();
    });

    test("should not allow out of bounds values", () => {
      const board1: BoardState = [-1, -1, -1, -1];
      const board2: BoardState = [-1, -1, -1];
      const position1_1: Position = [4, 0];
      const position1_2: Position = [0, 4];
      const position1_3: Position = [-1, 0];
      const position1_4: Position = [0, -1];
      const position1_5: Position = [3, 0];
      const position1_6: Position = [0, 3];

      expect(() => placeQueen(board1, position1_1)).toThrowError();
      expect(() => placeQueen(board1, position1_2)).toThrowError();
      expect(() => placeQueen(board1, position1_3)).toThrowError();
      expect(() => placeQueen(board1, position1_4)).toThrowError();
      expect(() => placeQueen(board1, position1_5)).not.toThrowError();
      expect(() => placeQueen(board1, position1_6)).not.toThrowError();


      const position2_1: Position = [3, 0];
      const position2_2: Position = [0, 3];
      const position2_3: Position = [-1, 0];
      const position2_4: Position = [0, -1];
      const position2_5: Position = [2, 0];
      const position2_6: Position = [0, 2];

      expect(() => placeQueen(board2, position2_1)).toThrowError();
      expect(() => placeQueen(board2, position2_2)).toThrowError();
      expect(() => placeQueen(board2, position2_3)).toThrowError();
      expect(() => placeQueen(board2, position2_4)).toThrowError();
      expect(() => placeQueen(board2, position2_5)).not.toThrowError();
      expect(() => placeQueen(board2, position2_6)).not.toThrowError();
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

    test("should return false for diagonal (y+c = x+c) conflict", () => {
      const boardState: BoardState = [1, -1, -1, -1]; // Queen at (0,1)
      const diagonalPosition: Position = [2, 3]; // Diagonal conflict with (0,1)

      const result = isSafe(boardState, diagonalPosition);

      expect(result).toBe(false);
    });

    test("should return false for diagonal (y+c = c-x) conflict", () => {
      const boardState: BoardState = [3, -1, -1, -1]; // Queen at (0,1)
      const diagonalPosition: Position = [2, 1]; // Diagonal conflict with (0,1)

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
    test("should return false for non-empty incomplete board", () => {
      const completeBoard1: BoardState = [1, 3, 0, -1];
      const completeBoard2: BoardState = [1, 3, -1, 2]
      const result1 = isComplete(completeBoard1);
      const result2 = isComplete(completeBoard2);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
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
