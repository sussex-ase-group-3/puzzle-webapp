// web/src/pages/PolyspherePage.tsx
import { useEffect, useRef, useState } from "react";
import type {
    PolyBoard,
    PolyPuzzleState,
    PolyStartRequest,
} from "../types";
import {
    startPolysphereSolver,
    getNextPolysphereSolutions,
    streamPolysphereSolutions,
    cancelPolysphereSolver,
} from "../api";
import { PolysphereBoard } from "../components/PolysphereBoard";

const DEFAULT_ROWS = 5;
const DEFAULT_COLS = 11;

export function PolyspherePage() {
    const [solutions, setSolutions] = useState<PolyPuzzleState[]>([]);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Start a fresh solver (empty board, all pieces)
    const onStart = async () => {
        setError(null);
        setSolutions([]);
        try {
            const req: PolyStartRequest = {
                // If you later allow partial inputs, fill these:
                // board, remainingPieces, maxSolutions
                maxSolutions: 10,
            };
            await startPolysphereSolver(req);
        } catch (e: any) {
            setError(e?.message ?? "Failed to start solver");
        }
    };

    // Pull next few solutions (batch)
    const onNextBatch = async () => {
        setError(null);
        try {
            const res = await getNextPolysphereSolutions(3);
            setSolutions((prev) => [...prev, ...res.solutions]);
            if (res.isComplete) {
                // no active generator anymore on server
            }
        } catch (e: any) {
            setError(e?.message ?? "Failed to get next solutions");
        }
    };

    // Stream solutions via SSE
    const onStream = async () => {
        setError(null);
        setStreaming(true);
        try {
            // Ensure a solver exists
            if (solutions.length === 0) {
                await onStart();
            }
            const es = streamPolysphereSolutions(400);
            eventSourceRef.current = es;

            es.addEventListener("solution", (evt: MessageEvent) => {
                try {
                    const data = JSON.parse(evt.data);
                    const state: PolyPuzzleState = data.solution;
                    setSolutions((prev) => [...prev, state]);
                } catch {
                    // ignore bad frames
                }
            });

            const handleComplete = () => {
                setStreaming(false);
                eventSourceRef.current?.close();
                eventSourceRef.current = null;
            };

            es.addEventListener("complete", handleComplete as any);
            es.addEventListener("error", () => {
                setError("Stream error");
                handleComplete();
            });
        } catch (e: any) {
            setError(e?.message ?? "Failed to stream solutions");
            setStreaming(false);
        }
    };

    const onCancel = async () => {
        setStreaming(false);
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
        try {
            await cancelPolysphereSolver();
        } catch (e) {
            // best-effort
        }
    };

    // Render the most recent solution if present
    const latest = solutions.at(-1);

    // Fallback: empty board
    const board: PolyBoard =
        latest?.board ??
        Array.from({ length: DEFAULT_ROWS }, () =>
            Array.from({ length: DEFAULT_COLS }, () => 0),
        );

    // NOTE: We assume board is a 2D array of numbers (0=empty, >0=piece id).
    // If your API returns a different structure, adjust the renderer mapping in PolysphereBoard.

    useEffect(() => {
        return () => {
            // cleanup on unmount
            eventSourceRef.current?.close();
        };
    }, []);

    return (
        <>
            <h1>Polysphere</h1>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={onStart}>Start</button>
                <button onClick={onNextBatch}>Next 3</button>
                <button onClick={onStream} disabled={streaming}>
                    {streaming ? "Streaming…" : "Stream"}
                </button>
                <button onClick={onCancel}>Cancel</button>
                <span>
          Received: {solutions.length} {solutions.length === 1 ? "state" : "states"}
        </span>
            </div>

            {error && <div style={{ color: "crimson" }}>{error}</div>}

            <PolysphereBoard board={board} />
            <p style={{ marginTop: 8 }}>
                Showing the latest solution state. Use <em>Next 3</em> or <em>Stream</em> to fetch more.
            </p>
        </>
    );
}
