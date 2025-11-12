// features/polysphere/components/SolutionGrid.tsx
import React from "react";
import type { Board } from "../utils";
import { PIECE_COLOURS } from "../pieces";

export function SolutionGrid({
                                 solutions,
                                 onSelect,
                                 columns = "repeat(auto-fill, minmax(140px, 1fr))",
                                 itemTitle,
                             }: {
    solutions: { board: Board }[] | Board[];     // accepts either shape
    onSelect?: (index: number) => void;
    columns?: string;                             // CSS grid-template-columns
    itemTitle?: (index: number) => string;
}) {
    // normalize to {board}
    const items = (solutions as any[]).map((s) => ("board" in s ? s : { board: s }));

    return (
        <div style={{ display: "grid", gridTemplateColumns: columns, gap: 12 }}>
            {items.map((s, i) => (
                <button
                    key={i}
                    onClick={() => onSelect?.(i)}
                    title={itemTitle ? itemTitle(i) : `Solution ${i + 1}`}
                    style={{
                        display: "grid",
                        gap: 6,
                        padding: 8,
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        cursor: "pointer",
                        textAlign: "left",
                    }}
                >
                    <MiniBoard board={s.board} />
                    <div style={{ fontSize: 12, color: "#555" }}>#{i + 1}</div>
                </button>
            ))}
        </div>
    );
}

function MiniBoard({ board }: { board: Board }) {
    const rows = board.length;
    const cols = board[0]?.length ?? 0;
    const cell = 12; // px
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
                gridAutoRows: `${cell}px`,
                background: "#f8fafc",
                padding: 4,
                borderRadius: 6,
            }}
        >
            {board.flatMap((row, r) =>
                row.map((pid, c) => {
                    const dark = (r + c) % 2 === 1;
                    const bg = dark ? "#eef2f7" : "#fff";
                    const colour = pid > 0 ? PIECE_COLOURS[pid] : null;
                    return (
                        <div
                            key={`${r}-${c}`}
                            style={{
                                width: cell,
                                height: cell,
                                display: "grid",
                                placeItems: "center",
                                background: bg,
                                border: "1px solid rgba(0,0,0,0.05)",
                            }}
                        >
                            {colour && (
                                <div
                                    style={{
                                        width: Math.floor(cell * 0.7),
                                        height: Math.floor(cell * 0.7),
                                        borderRadius: "50%",
                                        background: colour,
                                    }}
                                />
                            )}
                        </div>
                    );
                }),
            )}
        </div>
    );
}
