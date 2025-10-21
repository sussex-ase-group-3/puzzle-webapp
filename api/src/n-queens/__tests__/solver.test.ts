import { describe, test, expect } from "@jest/globals";
import { BoardState } from "../types.js";
import { solve } from "../solver.js";

describe("N-Queens Solver", () => {
  describe("solve", () => {
    test("should find solution for N=4 (smoke test)", () => {
      const solutions = solve(4);

      expect(solutions.length).toBeGreaterThan(0); // Should find at least one solution

      // Verify first solution is valid
      const firstSolution = solutions[0];
      expect(firstSolution.length).toBe(4);
      expect(firstSolution.every((col) => col >= 0 && col < 4)).toBe(true);
    });
  });
});
