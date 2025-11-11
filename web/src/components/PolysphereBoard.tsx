// web/src/components/PolysphereBoard.tsx
import React from "react";
import type { PolyBoard } from "../types";

export function PolysphereBoard({ board }: { board: PolyBoard }) {
    const rows = board.length;
    const cols = board[0]?.length ?? 0;
    const size = `min(40px, calc(75vmin/${Math.max(rows, cols)}))`;

    return (
        <div
            role="grid"
            aria-label={`${rows} by ${cols} polysphere board`}
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, ${size})`,
                gridAutoRows: `${size}`,
                border: "1px solid #ccc",
                width: "fit-content",
            }}
        >
            {board.flatMap((row, r) =>
                row.map((cell, c) => {
                    const filled = Number(cell) > 0;
                    const pieceId = filled ? Number(cell) : 0;
                    const dark = (r + c) % 2 === 1;
                    return (
                        <div
                            key={`${r}-${c}`}
                            role="gridcell"
                            aria-label={`Row ${r + 1} Col ${c + 1}${filled ? ` piece ${pieceId}` : ""}`}
                            style={{
                                border: "1px solid rgba(0,0,0,0.06)",
                                background: filled
                                    ? "#88c" // any filled cell
                                    : dark
                                        ? "#eee"
                                        : "#fff",
                                display: "grid",
                                placeItems: "center",
                                fontSize: "12px",
                                userSelect: "none",
                            }}
                            title={filled ? `Piece ${pieceId}` : ""}
                        >
                            {filled ? pieceId : ""}
                        </div>
                    );
                }),
            )}
        </div>
    );
}
