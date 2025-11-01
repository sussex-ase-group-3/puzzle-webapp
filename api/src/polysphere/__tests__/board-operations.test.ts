import { describe, test, expect } from "vitest";
import { placePiece, createEmptyBoard } from "../board-operations.js";
import { PuzzleState, Position } from "../types.js";
import { getPiece } from "../pieces.js";
import { range } from "../../utils.js";

describe("Board Operations", () => {
  describe("placePiece", () => {
    test("should place piece on empty board", () => {
      const initialState: PuzzleState = {
        board: createEmptyBoard(),
        remainingPieces: new Set(range(1, 13)),
      };
      const position: Position = [1, 2];

      const result = placePiece(initialState, 10, 0, false, position);

      const expectedState: PuzzleState = {
        board: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 10, 10, 10, 10, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        remainingPieces: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12]),
      };

      expect(result).toEqual(expectedState);
    });

    test("should return new board state without mutating original", () => {
      const initialBoard = createEmptyBoard();
      const initialState: PuzzleState = {
        board: initialBoard,
        remainingPieces: new Set([1, 2, 3, 5]),
      };
      const originalStateClone = {
        board: initialBoard.map((row) => [...row]),
        remainingPieces: new Set(initialState.remainingPieces),
      };
      const position: Position = [0, 0];

      const result = placePiece(initialState, 5, 0, false, position);

      // Original state should be unchanged
      expect(initialState).toEqual(originalStateClone);

      // Expected result state
      const expectedState: PuzzleState = {
        board: [
          [0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        remainingPieces: new Set([1, 3]),
      };

      expect(result).toEqual(expectedState);

      // Should be different objects
      expect(result.board).not.toBe(initialState.board);
      expect(result.remainingPieces).not.toBe(initialState.remainingPieces);
    });

    test("should not overwrite cell with existing piece", () => {
      const boardWithPiece = createEmptyBoard();
      boardWithPiece[1][1] = 1;
      boardWithPiece[1][2] = 1;
      boardWithPiece[1][3] = 1;

      const initialState: PuzzleState = {
        board: boardWithPiece,
        remainingPieces: new Set([2, 3, 4, 5]),
      };
      const position: Position = [1, 1];

      expect(() => {
        placePiece(initialState, 5, 0, false, position);
      }).toThrowError();
    });

    test("should not allow out of bounds values", () => {
      const initialState: PuzzleState = {
        board: createEmptyBoard(),
        remainingPieces: new Set([5, 10]),
      };

      // Test placing beyond right edge
      expect(() => {
        placePiece(initialState, 5, 0, false, [0, 8]);
      }).toThrowError();

      // Test placing beyond bottom edge
      expect(() => {
        placePiece(initialState, 10, 0, false, [4, 0]);
      }).toThrowError();

      // Test negative position
      expect(() => {
        placePiece(initialState, 10, 0, false, [-1, 0]);
      }).toThrowError();

      expect(() => {
        placePiece(initialState, 10, 0, false, [0, -1]);
      }).toThrowError();
    });

    test("should handle rotations correctly", () => {
      const initialState: PuzzleState = {
        board: createEmptyBoard(),
        remainingPieces: new Set([2, 3, 10]),
      };
      const position: Position = [1, 1];

      // Rotate piece 10 by 90 degrees (1 rotation)
      const result = placePiece(initialState, 10, 1, false, position);

      const expectedState: PuzzleState = {
        board: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        remainingPieces: new Set([2, 3]),
      };

      expect(result).toEqual(expectedState);
    });

    test("should handle flipping correctly", () => {
      const initialState: PuzzleState = {
        board: createEmptyBoard(),
        remainingPieces: new Set([1, 2, 3]),
      };
      const position: Position = [1, 1];

      // Place piece 2 flipped
      const result = placePiece(initialState, 2, 0, true, position);

      const expectedState: PuzzleState = {
        board: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        remainingPieces: new Set([1, 3]),
      };

      expect(result).toEqual(expectedState);
    });

    test("should throw error when piece is not in remaining pieces", () => {
      const initialState: PuzzleState = {
        board: createEmptyBoard(),
        remainingPieces: new Set([2, 3, 4]),
      };
      const position: Position = [0, 0];

      expect(() => {
        placePiece(initialState, 10, 0, false, position);
      }).toThrowError();
    });

    test("should validate rotation parameter", () => {
      const initialState: PuzzleState = {
        board: createEmptyBoard(),
        remainingPieces: new Set([1, 2, 3, 10]),
      };
      const position: Position = [0, 0];

      expect(() => {
        placePiece(initialState, 10, -1, false, position);
      }).toThrowError();

      expect(() => {
        placePiece(initialState, 10, 4, false, position);
      }).toThrowError();
    });
  });
});
