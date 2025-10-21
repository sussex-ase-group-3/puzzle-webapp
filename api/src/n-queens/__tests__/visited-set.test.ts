import { describe, test, expect } from "@jest/globals";
import { BoardState } from "../types.js";
import { wasPreviouslyComputed, recordExploredState } from "../visited-set.js";

describe("Visited Set Operations", () => {
  describe("wasPreviouslyComputed", () => {
    test("should return false for empty visited set", () => {
      const emptyVisitedSet = new Set<string>();
      const boardState: BoardState = [1, 3, 0, 2];

      const result = wasPreviouslyComputed(boardState, emptyVisitedSet);

      expect(result).toBe(false);
    });

    test("should return true for previously stored board state", () => {
      const visitedSet = new Set<string>();
      const boardState: BoardState = [1, 3, 0, 2];
      const serializedState = boardState.join(","); // "1,3,0,2"

      visitedSet.add(serializedState);

      const result = wasPreviouslyComputed(boardState, visitedSet);

      expect(result).toBe(true);
    });

    test("should return false for unseen board state", () => {
      const visitedSet = new Set<string>();
      const storedBoard: BoardState = [1, 3, 0, 2];
      const unseenBoard: BoardState = [0, 2, 1, 3];

      visitedSet.add(storedBoard.join(","));

      const result = wasPreviouslyComputed(unseenBoard, visitedSet);

      expect(result).toBe(false);
    });
  });

  describe("recordExploredState", () => {
    test("should add new board state to visited set", () => {
      const visitedSet = new Set<string>();
      const boardState: BoardState = [1, 3, 0, 2];

      recordExploredState(boardState, visitedSet);

      expect(visitedSet.has("1,3,0,2")).toBe(true);
      expect(visitedSet.size).toBe(1);
    });

    test("should handle duplicate board state additions", () => {
      const visitedSet = new Set<string>();
      const boardState: BoardState = [1, 3, 0, 2];

      recordExploredState(boardState, visitedSet);
      recordExploredState(boardState, visitedSet); // Add same state twice

      expect(visitedSet.has("1,3,0,2")).toBe(true);
      expect(visitedSet.size).toBe(1); // Should still be 1, not 2
    });

    test("should mutate the visited set by adding state", () => {
      const visitedSet = new Set<string>();
      const boardState: BoardState = [1, 3, 0, 2];

      expect(visitedSet.size).toBe(0); // Empty initially

      recordExploredState(boardState, visitedSet);

      expect(visitedSet.size).toBe(1); // Set was mutated
      expect(visitedSet.has("1,3,0,2")).toBe(true);
    });

    test("should not mutate original board state", () => {
      const visitedSet = new Set<string>();
      const originalBoard: BoardState = [1, 3, 0, 2];
      const boardCopy = [...originalBoard];

      recordExploredState(originalBoard, visitedSet);

      expect(originalBoard).toEqual(boardCopy); // Original unchanged
    });
  });
});
