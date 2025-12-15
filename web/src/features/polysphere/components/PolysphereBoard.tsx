// web/src/features/polysphere/components/PolysphereBoard.tsx
import React from "react";
import type { Board } from "../utils";
import { PIECE_COLOURS } from "../pieces";

export function PolysphereBoard({
  board,
  previewCells,
  editable = false,
  onCellMouseDown,
  onCellMouseEnter,
  onDragOverBoard,
  onDropOnBoard,
}: {
  board: Board;
  previewCells?: Set<string>;
  editable?: boolean;
  onCellMouseDown?: (r: number, c: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (r: number, c: number) => void;
  onDragOverBoard?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropOnBoard?: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const size = `min(calc(80vw / ${Math.max(rows, cols)}), calc((80vh - 100px) / ${Math.max(rows, cols)}))`;

  return (
    <div
      style={{
        width: "100%",
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "12px",
        scrollBehavior: "smooth",
        scrollbarWidth: "thin",
      }}
    >
      {/* Your board stays unchanged inside */}
      <div
        role="grid"
        aria-label={`${rows} by ${cols} board`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${size})`,
          gridAutoRows: size,
          gap: "4px",
          padding: "12px",
          borderRadius: "12px",
          background: "linear-gradient(145deg, #e8ebee, #c9ced1)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          width: "fit-content",
          userSelect: "none",
        }}
        onContextMenu={(e) => editable && e.preventDefault()}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOverBoard?.(e);
        }}
        onDrop={(e) => onDropOnBoard?.(e)}
      >
        {board.flatMap((row, r) =>
          row.map((cell, c) => {
            const k = `${r},${c}`;
            const dark = (r + c) % 2 === 1;
            const bg = dark ? "#f3f4f6" : "#ffffff";
            const pid = cell;
            const colour = pid > 0 ? PIECE_COLOURS[pid] : null;
            const showGhost = previewCells?.has(k);

            return (
              <div
                key={k}
                role="gridcell"
                data-cell={k}
                onMouseDown={(e) => editable && onCellMouseDown?.(r, c, e)}
                onMouseEnter={() => editable && onCellMouseEnter?.(r, c)}
                style={{
                  position: "relative",
                  borderRadius: "10px",
                  background: bg,
                  border: "1px solid rgba(0,0,0,0.07)",
                  display: "grid",
                  placeItems: "center",
                  cursor: editable ? "pointer" : "default",
                  transition: "transform 0.15s ease-out",
                }}
              >
                {colour && (
                  <div
                    style={{
                      width: "74%",
                      height: "74%",
                      borderRadius: "50%",
                      background: colour,
                      boxShadow: `
                                                0 0 8px ${colour}88,
                                                inset 0 2px 4px rgba(255,255,255,0.55),
                                                inset 0 -2px 4px rgba(0,0,0,0.35)
                                            `,
                    }}
                  />
                )}

                {showGhost && !colour && (
                  <div
                    style={{
                      position: "absolute",
                      width: "74%",
                      height: "74%",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.16)",
                      boxShadow: "0 0 10px rgba(0,0,0,0.25)",
                    }}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
