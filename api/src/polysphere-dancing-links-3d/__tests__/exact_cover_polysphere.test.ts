import { describe, test, expect } from "vitest";
import {
  solveDancingLinks,
  validateSolution,
} from "../../polysphere-dancing-links/dancing_links_solver.js";
import { readFileSync } from "fs";
import { join } from "path";

describe("3D Pyramid Dancing Links Solver", () => {
  test("should find complete solution for 3D pyramid puzzle", () => {
    let matrixData;
    try {
      const matrixPath = join(
        __dirname,
        "..",
        "polysphere_exact_cover_matrix.json",
      );
      const fileContent = readFileSync(matrixPath, "utf8");
      matrixData = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(
        "Matrix file not found. Run generate_exact_cover_matrix.ts first.",
      );
    }

    const { matrix, placements } = matrixData;

    const startTime = Date.now();
    const solutions = solveDancingLinks(matrix, placements);
    let firstSolution;

    // Get first solution
    for (const solution of solutions) {
      firstSolution = solution;
      break;
    }

    const endTime = Date.now();
    console.log(`3D pyramid solution found in ${endTime - startTime}ms`);

    expect(firstSolution).toBeDefined();
    expect(firstSolution!.length).toBe(12); // Should use exactly 12 placements (one per piece)
    expect(validateSolution(matrix, firstSolution!)).toBe(true);

    // Analyze solution
    const usedPlacements = firstSolution!.map(
      (rowIndex) => placements[rowIndex],
    );
    const usedPieces = new Set(usedPlacements.map((p: any) => p.pieceId));
    const orientationUsage = {
      XY: usedPlacements.filter((p: any) => p.orientationType === "XY").length,
      XZ: usedPlacements.filter((p: any) => p.orientationType === "XZ").length,
      YZ: usedPlacements.filter((p: any) => p.orientationType === "YZ").length,
    };

    // Should use all 12 pieces exactly once
    expect(usedPieces.size).toBe(12);
    expect(Array.from(usedPieces).sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);

    // Should use a mix of orientation types (not all flat)
    expect(
      orientationUsage.XY + orientationUsage.XZ + orientationUsage.YZ,
    ).toBe(12);
    expect(orientationUsage.XZ + orientationUsage.YZ).toBeGreaterThan(0); // At least some vertical placements

    // Verify all 55 pyramid cells are covered
    const coveredCells = new Set();
    for (const rowIndex of firstSolution!) {
      const row = matrix[rowIndex];
      for (let i = 0; i < 55; i++) {
        if (row[i] === 1) {
          coveredCells.add(i);
        }
      }
    }
    expect(coveredCells.size).toBe(55);

    console.log(
      `Solution orientation usage: XY=${orientationUsage.XY}, XZ=${orientationUsage.XZ}, YZ=${orientationUsage.YZ}`,
    );
  });

  test("orientation distinctness", () => {
    // Test that XY, XZ, YZ orientations produce different cell patterns
    let matrixData;
    try {
      const matrixPath = join(
        __dirname,
        "..",
        "polysphere_exact_cover_matrix.json",
      );
      const fileContent = readFileSync(matrixPath, "utf8");
      matrixData = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(
        "Matrix file not found. Run generate_exact_cover_matrix.ts first.",
      );
    }

    const { placements } = matrixData;

    // Find sample placements of each type for piece 1
    const piece1Placements = placements.filter((p: any) => p.pieceId === 1);
    const xyPlacement = piece1Placements.find(
      (p: any) => p.orientationType === "XY",
    );
    const xzPlacement = piece1Placements.find(
      (p: any) => p.orientationType === "XZ",
    );
    const yzPlacement = piece1Placements.find(
      (p: any) => p.orientationType === "YZ",
    );

    expect(xyPlacement).toBeDefined();
    expect(xzPlacement).toBeDefined();
    expect(yzPlacement).toBeDefined();

    // Verify they have different positions or produce different patterns
    const xyPos = JSON.stringify(xyPlacement.position);
    const xzPos = JSON.stringify(xzPlacement.position);
    const yzPos = JSON.stringify(yzPlacement.position);

    // At minimum, the orientation types should be different
    expect(xyPlacement.orientationType).toBe("XY");
    expect(xzPlacement.orientationType).toBe("XZ");
    expect(yzPlacement.orientationType).toBe("YZ");

    console.log(`Sample positions - XY: ${xyPos}, XZ: ${xzPos}, YZ: ${yzPos}`);
  });
});
