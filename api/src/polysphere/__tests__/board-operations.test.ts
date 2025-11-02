import { describe, test, expect } from "vitest";
import { selectNextPiece } from "../board-operations.js";
import { getPiece, getPieceBoundingBoxArea } from "../pieces.js";

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
