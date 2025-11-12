// web/src/features/polysphere/page/PolyspherePage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { PolysphereBoard } from "../components/PolysphereBoard";
import { PiecePalette, DND_MIME } from "../components/PiecePalette";
import { PIECE_SHAPES, toOffsets } from "../pieces";
import {
    ALL_PIECES, Board, emptyBoard, rotateOffsets, flipHOffsets,
    canPlace, place, erasePiece, remainingFromAllowed, piecesPresent
} from "../utils";
import {
    startPolysphereSolver, getNextPolysphereSolutions,
    streamPolysphereSolutions, cancelPolysphereSolver
} from "../api";

import { SolutionGrid } from "../components/SolutionGrid";

type DragPayload = { pieceId: number; turns: 0|1|2|3; flip: boolean };

export function PolyspherePage() {
    // editor state
    const [draft, setDraft] = useState<Board>(() => emptyBoard());
    const [allowed, setAllowed] = useState<number[]>(() => [...ALL_PIECES]);

    // palette state
    const [selected, setSelected] = useState<number>(1);
    const [turns, setTurns] = useState<0|1|2|3>(0);
    const [flip, setFlip] = useState<boolean>(false);

    // solver state
    const [active, setActive] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [solutions, setSolutions] = useState<{ board: Board }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const esRef = useRef<EventSource | null>(null);

    // preview cells for drag-over ghost
    const [preview, setPreview] = useState<Set<string> | null>(null);

    // disable palette buttons for pieces already placed
    const placed = useMemo(() => piecesPresent(draft), [draft]);
    const disabledIds = placed;

    // drag over: compute ghost from pointer target cell
    const onDragOverBoard = (e: React.DragEvent<HTMLDivElement>) => {
        const data = e.dataTransfer.getData(DND_MIME);
        if (!data) { setPreview(null); return; }
        let payload: DragPayload;
        try { payload = JSON.parse(data); } catch { setPreview(null); return; }

        const cell = (e.target as HTMLElement).closest("[data-cell]") as HTMLElement | null;
        if (!cell) { setPreview(null); return; }
        const [r0, c0] = cell.dataset.cell!.split(",").map(Number);

        const base = toOffsets(PIECE_SHAPES[payload.pieceId]);
        let offsets = rotateOffsets(base, payload.turns);
        if (payload.flip) offsets = flipHOffsets(offsets);

        // build preview set (no validity colouring yet; simple ghost)
        const ghost = new Set<string>();
        for (const [dr, dc] of offsets) {
            const r = r0 + dr, c = c0 + dc;
            if (r >= 0 && r < draft.length && c >= 0 && c < draft[0].length) {
                ghost.add(`${r},${c}`);
            }
        }
        setPreview(ghost);
    };

    // drop: attempt to place
    const onDropOnBoard = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setPreview(null);

        const data = e.dataTransfer.getData(DND_MIME);
        if (!data) return;

        let payload: DragPayload;
        try { payload = JSON.parse(data); } catch { return; }

        const cell = (e.target as HTMLElement).closest("[data-cell]") as HTMLElement | null;
        if (!cell) return;
        const [r0, c0] = cell.dataset.cell!.split(",").map(Number);

        const base = toOffsets(PIECE_SHAPES[payload.pieceId]);
        let offsets = rotateOffsets(base, payload.turns);
        if (payload.flip) offsets = flipHOffsets(offsets);

        if (!canPlace(draft, offsets, r0, c0)) {
            setError("Can't place piece there (overlap or out of bounds).");
            return;
        }

        setDraft(b => place(b, offsets, r0, c0, payload.pieceId));
        // Optional: auto-mark disallowed in 'allowed' once placed (one copy each)
        setAllowed(a => a.filter(id => id !== payload.pieceId));
    };

    // EDIT: right-click to erase contiguous piece
    const onCellMouseDown = (r:number, c:number, e: React.MouseEvent) => {
        if (e.button === 2) {
            setDraft(b => erasePiece(b, r, c));
            if (draft[r][c] > 0) {
                // piece might become available again
                setAllowed(a => Array.from(new Set([...a, draft[r][c]])).sort((x,y)=>x-y));
            }
        }
    };

    const onStart = async () => {
        setError(null); setSolutions([]); setActive(false);
        try {
            const remaining = remainingFromAllowed([...ALL_PIECES], draft); // or from 'allowed' if you prefer manual curation
            await startPolysphereSolver({
                board: draft,
                remainingPieces: remaining,
                maxSolutions: 200,
            });
            setActive(true);
        } catch (e: any) {
            setError(e?.message ?? "Failed to start solver");
        }
    };

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

    const onStream = async () => {
        setError(null);
        if (!active) {
            try { await onStart(); } catch { return; }
        }
        setStreaming(true);
        const es = streamPolysphereSolutions(200);
        esRef.current = es;

        es.addEventListener("solution", (evt: MessageEvent) => {
            try {
                const data = JSON.parse(evt.data);
                setSolutions(prev => [...prev, data.solution]);
            } catch {}
        });

        const end = () => { setStreaming(false); setActive(false); esRef.current?.close(); esRef.current = null; };
        es.addEventListener("complete", end as any);
        es.addEventListener("error", () => { setError("Stream error"); end(); });
    };

    const onCancel = async () => {
        setStreaming(false);
        esRef.current?.close(); esRef.current = null;
        try { await cancelPolysphereSolver(); } catch {}
        setActive(false);
    };

    useEffect(() => () => { esRef.current?.close(); }, []);

    const latest = solutions.length ? solutions[solutions.length - 1] : null;
    const display = latest?.board ?? draft;

    return (
        <div>
            <h1>Polysphere</h1>

            <div style={{ display:"grid", gridTemplateColumns:"minmax(240px, 360px) 1fr", gap:16, alignItems:"start" }}>
                {/* Left: palette */}
                <div style={{ display:"grid", gap:12 }}>
                    <PiecePalette
                        selected={selected} setSelected={setSelected}
                        turns={turns} setTurns={setTurns}
                        flip={flip} setFlip={setFlip}
                        disabledIds={disabledIds}
                    />

                    <div style={{ display:"grid", gap:6 }}>
                        <button onClick={onStart}>Start</button>
                        <button onClick={onNextBatch} disabled={!active || streaming}>Next 10</button>
                        <button onClick={onStream} disabled={streaming}>{streaming ? "Streaming…" : "Stream"}</button>
                        <button onClick={onCancel}>Cancel</button>
                        <button onClick={()=>{ setDraft(emptyBoard()); setSolutions([]); setActive(false); setStreaming(false); setAllowed([...ALL_PIECES]); }}>
                            Reset
                        </button>
                        <div>Active: {String(active)} • Received: {solutions.length}</div>
                    </div>

                    {error && <div style={{ color:"crimson" }}>{error}</div>}
                </div>

                {/* Right: board */}
                <div>
                    <div style={{ marginBottom:8, fontWeight:600 }}>
                        {latest ? "Latest solution" : "Editor (drag a piece, right-click to erase)"}
                    </div>
                    <PolysphereBoard
                        board={display}
                        previewCells={preview ?? undefined}
                        editable={!latest}
                        onCellMouseDown={onCellMouseDown}
                        onCellMouseEnter={() => {}}
                        onDragOverBoard={onDragOverBoard}
                        onDropOnBoard={onDropOnBoard}
                    />
                </div>
            </div>
            {/* All Solutions gallery */}
            {solutions.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>
                        All solutions ({solutions.length})
                    </div>
                    <SolutionGrid
                        solutions={solutions}
                        // Move clicked solution to the end so it becomes the "latest" in the big viewer
                        onSelect={(idx) => {
                            setSolutions((prev) => {
                                const sel = prev[idx];
                                return [...prev.slice(0, idx), ...prev.slice(idx + 1), sel];
                            });
                        }}
                        // Wider thumbs on big screens, still wraps nicely
                        columns="repeat(auto-fill, minmax(150px, 1fr))"
                        itemTitle={(i) => `Solution ${i + 1}`}
                    />
                </div>
            )}

        </div>
    );
}
