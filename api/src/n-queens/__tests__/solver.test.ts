import { describe, test, expect } from "vitest";
import { solve } from "../solver.js";
import { BoardState } from "../types.js";

describe("N-Queens Solver", () => {
  describe("solve", () => {
    test("should find solution for N=4 (smoke test)", () => {
      const solutions = solve([-1, -1, -1, -1]);

      expect(solutions.size).toBeGreaterThan(0) // Should find at least one solution

      // Verify first solution is valid
      const firstSolution: BoardState = solutions.values().next().value!;

      expect(firstSolution.length).toBe(4);
      expect(firstSolution.every((col) => col >= 0 && col < 4)).toBe(true);
    });
  });
});
