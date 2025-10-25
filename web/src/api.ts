import type { SolveRequest, SolveResponse } from "./types";

export async function fetchSolutions(req: SolveRequest): Promise<SolveResponse> {
  const res = await fetch("/api/nqueens/solve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Solve failed: ${res.status} ${msg}`);
  }
  return res.json();
}
