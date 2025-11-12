import type { SolveRequest, SolveResponse } from "./types";

export async function fetchNQueenSolutions(
    req: SolveRequest,
): Promise<SolveResponse> {
    const response = await fetch("/api/n-queens/solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n: req.n, board: req.partial }),
    });
    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Solve failed: ${response.status} ${errorText}`);
    }
    return response.json();
}