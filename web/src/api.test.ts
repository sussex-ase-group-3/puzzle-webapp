// web/src/api.test.ts
import { describe, it, expect, vi } from "vitest";
import { fetchSolutions } from "./api";
import type { SolveResponse } from "./types";

describe("fetchSolutions", () => {
  it("calls /api/nqueens/solve and returns parsed JSON", async () => {
    const fakeData: SolveResponse = { solutions: [[1, 3, 0, 2]] };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeData,
    }) as any;

    const res = await fetchSolutions({ n: 4, partial: [-1, -1, -1, -1] });
    expect(res).toEqual(fakeData);
    expect(fetch).toHaveBeenCalledWith(
      "/api/solver",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
