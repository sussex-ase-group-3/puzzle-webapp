// web/src/api.test.ts
import { describe, it, expect, vi } from "vitest";
import { fetchNQueenSolutions } from "./api";
import type { SolveResponse } from "./types";

describe("fetchNQueenSolutions", () => {
  it("calls /api/solver and returns parsed JSON", async () => {
    const fakeData: SolveResponse = { solutions: [[1, 3, 0, 2]] };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeData,
    }) as any;

    const res = await fetchNQueenSolutions({ n: 4, partial: [-1, -1, -1, -1] });
    expect(res).toEqual(fakeData);
    expect(fetch).toHaveBeenCalledWith(
      "/api/n-queens/solver",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
