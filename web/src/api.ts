import type { SolveRequest, SolveResponse } from "./types";

/**
 * Sends a POST request to the N-Queens solver API and returns the solutions.
 * Throws an error if the server response is not OK.
 */
export async function fetchSolutions(
  req: SolveRequest,
): Promise<SolveResponse> {
  const response = await fetch("/api/solver", {
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
