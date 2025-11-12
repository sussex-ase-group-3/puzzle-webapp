// web/src/features/polysphere/components/PolysphereBoard.tsx
import React from "react";
import type { Board } from "../utils";
import { PIECE_COLOURS } from "../pieces";

export function PolysphereBoard({
                                    board, previewCells, editable=false, onCellMouseDown, onCellMouseEnter,
                                    onDragOverBoard, onDropOnBoard,
                                }: {
    board: Board;
    previewCells?: Set<string>;
    editable?: boolean;
    onCellMouseDown?: (r:number,c:number,e:React.MouseEvent)=>void;
    onCellMouseEnter?: (r:number,c:number)=>void;
    onDragOverBoard?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDropOnBoard?: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
    const rows = board.length;
    const cols = board[0]?.length ?? 0;
    const size = `min(44px, calc(75vmin/${Math.max(rows, cols)}))`;

    return (
        <div
            role="grid"
            aria-label={`${rows} by ${cols} board`}
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, ${size})`,
                gridAutoRows: size,
                border: "1px solid #ccc",
                width: "fit-content",
                userSelect: "none",
            }}
            onContextMenu={(e) => editable && e.preventDefault()}
            onDragOver={(e) => { e.preventDefault(); onDragOverBoard?.(e); }}
            onDrop={(e) => onDropOnBoard?.(e)}
        >
            {board.flatMap((row, r) =>
                row.map((cell, c) => {
                    const k = `${r},${c}`;
                    const dark = (r + c) % 2 === 1;
                    const bg = dark ? "#eee" : "#fff";
                    const pid = cell;
                    const colour = pid > 0 ? PIECE_COLOURS[pid] : null;
                    const showGhost = previewCells?.has(k);

                    return (
                        <div
                            key={k}
                            role="gridcell"
                            style={{
                                position: "relative",
                                border: "1px solid rgba(0,0,0,0.06)",
                                background: bg,
                                cursor: editable ? "pointer" : "default",
                                display: "grid",
                                placeItems: "center",
                            }}
                            onMouseDown={(e)=>editable && onCellMouseDown?.(r, c, e)}
                            onMouseEnter={()=>editable && onCellMouseEnter?.(r, c)}
                            data-cell={`${r},${c}`} // for drop targeting
                        >
                            {/* filled cell as coloured circle */}
                            {colour && (
                                <div style={{ width: "70%", height: "70%", borderRadius: "50%", background: colour }} />
                            )}
                            {/* ghost preview */}
                            {showGhost && !colour && (
                                <div style={{ position:"absolute", width: "70%", height: "70%", borderRadius:"50%", background:"rgba(0,0,0,0.18)" }} />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
