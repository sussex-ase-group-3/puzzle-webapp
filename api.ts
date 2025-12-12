import type {
    PolyNextResponse,
    PolyStartRequest,
    PyramidNextResponse,
    PyramidStartRequest,
    BatchEvent
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

/** Polysphere 3D — start (POST /polysphere-3d/solver) */
export async function startPolysphere3DSolver(
    req: PyramidStartRequest = {},
): Promise<{ success: true; maxSolutions: number }> {
    const response = await fetch("/api/polysphere-3d/solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...req,
            // Ensure measureStats is passed (default to false if not specified)
            measureStats: req.measureStats ?? false,
        }),
    });
    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
            `Start polysphere 3D failed: ${response.status} ${errorText}`,
        );
    }
    return response.json();
}

/** Polysphere 3D — get next batch (GET /polysphere-3d/solver/next?count=N) */
export async function getNextPolysphere3DSolutions(
    count = 1,
): Promise<PyramidNextResponse> {
    const response = await fetch(`/api/polysphere-3d/solver/next?count=${count}`);
    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
            `Next polysphere 3D failed: ${response.status} ${errorText}`,
        );
    }
    return response.json();
}

/** Polysphere 3D — stream SSE (GET /polysphere-3d/solver/stream?interval=ms) */
export function streamPolysphere3DSolutions(intervalMs = 500): EventSource {
    const es = new EventSource(`/api/polysphere-3d/solver/stream?interval=${intervalMs}`);
    return es;
}

/** Polysphere 3D — cancel (DELETE /polysphere-3d/solver) */
export async function cancelPolysphere3DSolver(): Promise<{ success: boolean }> {
    const response = await fetch("/api/polysphere-3d/solver", { method: "DELETE" });
    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
            `Cancel polysphere 3D failed: ${response.status} ${errorText}`,
        );
    }
    return response.json();
}

/** Utility function to parse batch events from EventSource */
export function parseBatchEvent<T>(event: MessageEvent): BatchEvent {
    try {
        return JSON.parse(event.data) as BatchEvent;
    } catch (error) {
        console.error("Failed to parse batch event:", error);
        throw new Error("Invalid batch event data");
    }
}

/** Check solver status (both 2D and 3D) */
export async function checkSolverStatus(): Promise<{
    active: boolean;
    type: '2d' | '3d' | 'none';
    solverId?: string;
}> {
    const response = await fetch("/api/solver/status");
    if (!response.ok) {
        return { active: false, type: 'none' };
    }
    return response.json();
}

/** Mock 3D solver functions for development/testing (optional) */
export const mockPolysphere3DSolver = {
    start: async function(req: PyramidStartRequest = {}): Promise<{ success: true; maxSolutions: number }> {
        console.log("Mock 3D solver started with params:", req);
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, maxSolutions: req.maxSolutions || 1000 };
    },
    
    getNext: async function(count = 1): Promise<PyramidNextResponse> {
        console.log("Mock 3D solver getting next batch, count:", count);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            solutions: [],
            isComplete: true,
            foundSolutions: 0,
            maxSolutions: 1000,
            stats: {
                time: 1500,
                nodesVisited: 7500,
                backtracks: 120,
                memoryUsage: 1024 * 1024 * 2, // 2MB
            }
        };
    },
    
    stream: function(intervalMs = 500): EventSource {
        console.log("Mock 3D solver streaming started");
        const mockES = {
            addEventListener: (type: string, listener: (event: any) => void) => {
                if (type === 'batch') {
                    setTimeout(() => {
                        const mockEvent = {
                            data: JSON.stringify({
                                solutions: [],
                                batchNumber: 1,
                                totalSoFar: 0,
                            }),
                        };
                        listener(mockEvent as MessageEvent);
                    }, 1000);
                }
                
                if (type === 'complete') {
                    setTimeout(() => {
                        listener(new Event('complete'));
                    }, 3000);
                }
            },
            close: () => {
                console.log("Mock 3D EventSource closed");
            },
        } as any;
        
        return mockES;
    },
    
    cancel: async function(): Promise<{ success: boolean }> {
        console.log("Mock 3D solver cancelled");
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
    }
};