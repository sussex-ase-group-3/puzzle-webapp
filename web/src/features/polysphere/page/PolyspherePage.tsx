import { useEffect, useMemo, useRef, useState } from "react";
import type { PolyBoard, PolyPuzzleState } from "../types";
import {
    startPolysphereSolver,
    getNextPolysphereSolutions,
    streamPolysphereSolutions,
    cancelPolysphereSolver,
} from "../api";
import { PolysphereBoard } from "../components/PolysphereBoard";

const ROWS = 5, COLS = 11;
const ALL_PIECES = Array.from({ length: 12 }, (_, i) => i + 1);

function makeEmpty(): PolyBoard {
    return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 0));
}

export function PolyspherePage() {
    // editable partial board
    const [draft, setDraft] = useState<PolyBoard>(() => makeEmpty());
    const [remaining, setRemaining] = useState<number[]>(() => [...ALL_PIECES]);
    const [brush, setBrush] = useState<number>(1); // current piece id to paint
    const [dragPaint, setDragPaint] = useState<number | null>(null);

    // solver I/O
    const [active, setActive] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [solutions, setSolutions] = useState<PolyPuzzleState[]>([]);
    const [error, setError] = useState<string | null>(null);
    const esRef = useRef<EventSource | null>(null);

    // latest solution + fallback to draft
    const latest = useMemo(
        () => (solutions.length ? solutions[solutions.length - 1] : null),
        [solutions],
    );
    const displayBoard = latest?.board ?? draft;

    // board editing
    const paint = (r: number, c: number, value: number) => {
        setDraft(b => {
            const next = b.map(row => row.slice());
            next[r][c] = value;
            return next;
        });
    };

    const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
        e.preventDefault();
        const value = e.button === 2 ? 0 : brush; // right-click = erase
        setDragPaint(value);
        paint(r, c, value);
    };

    const handleCellEnter = (r: number, c: number) => {
        if (dragPaint !== null) paint(r, c, dragPaint);
    };

    const handleMouseUp = () => setDragPaint(null);

    // start solver with current draft & remaining
    const onStart = async () => {
        setError(null);
        setSolutions([]);
        setActive(false);
        try {
            await startPolysphereSolver({
                board: draft,
                remainingPieces: remaining.slice().sort((a, b) => a - b),
                maxSolutions: 200, // you can tune or expose in UI
            });
            setActive(true);
        } catch (e: any) {
            setError(e?.message ?? "Failed to start solver");
        }
    };

    // get a batch (pagination)
    const onNextBatch = async () => {
        if (!active) { setError("Start the solver first"); return; }
        setError(null);
        try {
            const res = await getNextPolysphereSolutions(10);
            setSolutions(prev => [...prev, ...res.solutions]);
            if (res.isComplete) setActive(false);
        } catch (e: any) {
            setError(e?.message ?? "Failed to get next solutions");
        }
    };

    // stream continuously
    const onStream = async () => {
        setError(null);
        if (!active) {
            // try to start with current draft if not active
            try {
                await onStart();
            } catch {
                return;
            }
        }
        setStreaming(true);
        const es = streamPolysphereSolutions(200);
        esRef.current = es;

        es.addEventListener("solution", (evt: MessageEvent) => {
            try {
                const data = JSON.parse(evt.data);
                const state: PolyPuzzleState = data.solution;
                setSolutions(prev => [...prev, state]);
            } catch { /* ignore */ }
        });

        const endStream = () => {
            setStreaming(false);
            setActive(false);
            esRef.current?.close();
            esRef.current = null;
        };

        es.addEventListener("complete", endStream as any);
        es.addEventListener("error", () => {
            setError("Stream error");
            endStream();
        });
    };

    const onCancel = async () => {
        setStreaming(false);
        esRef.current?.close(); esRef.current = null;
        try { await cancelPolysphereSolver(); } catch {}
        setActive(false);
    };

    // cleanup stream on unmount
    useEffect(() => () => { esRef.current?.close(); }, []);

    // UI
    return (
        <div onMouseUp={handleMouseUp}>
            <h1>Polysphere</h1>

            {/* piece palette + remaining picker */}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                    <div style={{ marginBottom: 6, fontWeight: 600 }}>Brush</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 360 }}>
                        {ALL_PIECES.map(pid => (
                            <button
                                key={pid}
                                onClick={() => setBrush(pid)}
                                style={{
                                    width: 34, height: 34, borderRadius: 6,
                                    border: brush === pid ? "2px solid #335" : "1px solid #ccc",
                                    background: brush === pid ? "#cde" : "#f8f8f8",
                                    cursor: "pointer",
                                }}
                                title={`Piece ${pid}`}
                            >
                                {pid}
                            </button>
                        ))}
                        <button
                            onClick={() => setBrush(0)}
                            style={{
                                width: 34, height: 34, borderRadius: 6,
                                border: brush === 0 ? "2px solid #533" : "1px solid #ccc",
                                background: brush === 0 ? "#fde" : "#f8f8f8",
                            }}
                            title="Eraser"
                        >
                            ␡
                        </button>
                    </div>
                </div>

                <div>
                    <div style={{ marginBottom: 6, fontWeight: 600 }}>Remaining pieces</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, auto)", gap: 6 }}>
                        {ALL_PIECES.map(pid => {
                            const checked = remaining.includes(pid);
                            return (
                                <label key={pid} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                            setRemaining(prev => checked ? prev.filter(x => x !== pid) : [...prev, pid]);
                                        }}
                                    />
                                    {pid}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                    <button onClick={onStart}>Start</button>
                    <button onClick={onNextBatch} disabled={!active || streaming}>Next 10</button>
                    <button onClick={onStream} disabled={streaming}> {streaming ? "Streaming…" : "Stream"} </button>
                    <button onClick={onCancel}>Cancel</button>
                    <button onClick={() => { setDraft(makeEmpty()); setSolutions([]); setActive(false); setStreaming(false); }}>Reset</button>
                    <div>Active: {String(active)} • Received: {solutions.length}</div>
                </div>
            </div>

            {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, marginTop: 16 }}>
                {/* Editable Draft (left) */}
                {!latest && (
                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 600 }}>Draft (click/drag to paint; right-click to erase)</div>
                        <PolysphereBoard
                            board={draft}
                            editable
                            onCellDown={handleCellMouseDown}
                            onCellEnter={handleCellEnter}
                        />
                    </div>
                )}

                {/* Latest Solution (or Draft) */}
                <div>
                    <div style={{ marginBottom: 6, fontWeight: 600 }}>
                        {latest ? "Latest solution" : "Preview (no solutions yet)"}
                    </div>
                    <PolysphereBoard
                        board={displayBoard}
                        // read-only
                    />
                </div>
            </div>

            {/* Thumbnails */}
            {solutions.length > 1 && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ marginBottom: 6, fontWeight: 600 }}>All solutions</div>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                        {solutions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    // “jump to” by reordering: move clicked solution to end so it shows as latest
                                    setSolutions(prev => [...prev.slice(0, i), ...prev.slice(i + 1), prev[i]]);
                                }}
                                style={{ border: "1px solid #ddd", padding: 4, background: "#fff", cursor: "pointer" }}
                                title={`Solution ${i + 1}`}
                            >
                                <MiniBoard board={s.board} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function MiniBoard({ board }: { board: PolyBoard }) {
    const rows = board.length, cols = board[0]?.length ?? 0;
    const size = 8;
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${size}px)`,
            gridAutoRows: `${size}px`
        }}>
            {board.flatMap((row, r) =>
                row.map((cell, c) => {
                    const filled = cell > 0;
                    const dark = (r + c) % 2 === 1;
                    return (
                        <div key={`${r}-${c}`} style={{
                            width: size, height: size,
                            background: filled ? "#88c" : (dark ? "#eee" : "#fff"),
                            border: "1px solid rgba(0,0,0,0.05)"
                        }} />
                    );
                })
            )}
        </div>
    );
}
