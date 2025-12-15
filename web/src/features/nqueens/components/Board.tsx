import React from "react";
import type { BoardState } from "../types";

export function Board({
  n,
  placement,
  editable,
  onToggle,
}: {
  n: number;
  placement: BoardState;
  editable: boolean;
  onToggle: (row: number, col: number) => void;
}) {
  // Calculate exact size to fit container without overflow
  const size = `min(calc(90vw / ${n + 1}), calc(50vh / ${n + 1}))`;

  return (
    <div
      role="grid"
      aria-label={`${n} by ${n} board`}
      className="board"
      style={{
        gridTemplateColumns: `repeat(${n}, ${size})`,
        gridAutoRows: `${size}`,
        width: "fit-content",
        height: "fit-content",
        margin: "0 auto",
      }}
    >
      {Array.from({ length: n * n }, (_, i) => {
        const r = Math.floor(i / n),
          c = i % n;
        const hasQ = placement[r] === c;
        const dark = (r + c) % 2 === 1;

        return (
          <button
            key={i}
            role="gridcell"
            aria-label={`Row ${r + 1} Col ${c + 1}${hasQ ? " with queen" : ""}`}
            disabled={!editable}
            onClick={() => editable && onToggle(r, c)}
            className="cell"
            style={{
              background: dark ? "#212121ff" : "#fefefe",
              color: dark ? "white" : "black",
              cursor: editable ? "pointer" : "default",
              fontSize: "clamp(12px, 3vmin, 20px)",
              border: "none",
              transition: "all 0.2s",
              boxShadow: hasQ ? "0 0 8px rgba(255,255,255,0.8)" : "none",
            }}
            onMouseEnter={(e) => {
              if (editable) e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              if (editable) e.currentTarget.style.filter = "brightness(1)";
            }}
          >
            {hasQ && <span className="queen">♕</span>}
          </button>
        );
      })}
    </div>
  );
}
