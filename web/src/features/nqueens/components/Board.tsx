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
  const size = `max(68px, calc(80vmin/${n}))`;

  return (
    <div
      role="grid"
      aria-label={`${n} by ${n} board`}
      style={{
        display: "grid",
        flexWrap: "wrap",
        gridTemplateColumns: `repeat(${n}, ${size})`,
        gridAutoRows: `${size}`,
        gap: "4px",
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "4px",
        background: "rgba(0, 0, 0, 1)", // optional board background
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
            style={{
              width: size,
              height: size,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "clamp(20px, 5vmin, 32px)",
              background: dark ? "#212121ff" : "#fefefe",
              color: dark ? "white" : "black",
              border: "none",
              cursor: editable ? "pointer" : "default",
              transition: "all 0.2s",
              boxShadow: hasQ ? "0 0 8px rgba(255,255,255,0.8)" : "none",
            }}
            onMouseEnter={(e) => {
              if (editable)
                e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              if (editable) e.currentTarget.style.filter = "brightness(1)";
            }}
          >
            {hasQ && <span style={{ fontSize: "clamp(40px, 5vmin, 32px)" }}>♕</span>}

          </button>
        );
      })}
    </div>
  );
}
