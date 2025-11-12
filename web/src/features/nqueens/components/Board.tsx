import React from "react";
import type { BoardState } from "../types";

export function Board({
  n, placement, editable, onToggle
}: {
  n: number;
  placement: BoardState;
  editable: boolean;
  onToggle: (row: number, col: number) => void;
}) {
  const size = `min(48px, calc(80vmin/${n}))`;
  return (
    <div
      role="grid"
      aria-label={`${n} by ${n} board`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${n}, ${size})`,
        gridAutoRows: `${size}`,
        border: "1px solid #ccc",
        width: "fit-content"
      }}
    >
      {Array.from({ length: n * n }, (_, i) => {
        const r = Math.floor(i / n), c = i % n;
        const hasQ = placement[r] === c;
        const dark = (r + c) % 2 === 1;
        return (
          <button
            key={i}
            role="gridcell"
            aria-label={`Row ${r + 1} Col ${c + 1}${hasQ ? " with queen" : ""}`}
            disabled={!editable}
            onClick={() => editable && onToggle(r, c)}
            style={{
              border: "none",
              background: dark ? "#b58863" : "#f0d9b5",
              cursor: editable ? "pointer" : "default",
              fontSize: "clamp(16px, 6vmin, 26px)"
            }}
          >
            {hasQ ? "♛" : ""}
          </button>
        );
      })}
    </div>
  );
}
