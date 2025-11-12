import type {
    PolyNextResponse,
    PolyStartRequest,
} from "./types";

/** Polysphere — start (POST /polysphere/solver) */
export async function startPolysphereSolver(
    req: PolyStartRequest = {},
): Promise<{ success: true; maxSolutions: number }> {
    const response = await fetch("/api/polysphere/solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
    });
    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
            `Start polysphere failed: ${response.status} ${errorText}`,
        );
    }
    return response.json();
}

/** Polysphere — get next batch (GET /polysphere/solver/next?count=N) */
export async function getNextPolysphereSolutions(
    count = 1,
): Promise<PolyNextResponse> {
    const response = await fetch(`/api/polysphere/solver/next?count=${count}`);
    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
            `Next polysphere failed: ${response.status} ${errorText}`,
        );
    }
    return response.json();
}

/** Polysphere — stream SSE (GET /polysphere/solver/stream?interval=ms) */
export function streamPolysphereSolutions(intervalMs = 500): EventSource {
    // NOTE: EventSource only supports GET and ignores headers.
    const es = new EventSource(`/api/polysphere/solver/stream?interval=${intervalMs}`);
    return es;
}

/** Polysphere — cancel (DELETE /polysphere/solver) */
export async function cancelPolysphereSolver(): Promise<{ success: boolean }> {
    const response = await fetch("/api/polysphere/solver", { method: "DELETE" });
    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
            `Cancel polysphere failed: ${response.status} ${errorText}`,
        );
    }
    return response.json();
}
