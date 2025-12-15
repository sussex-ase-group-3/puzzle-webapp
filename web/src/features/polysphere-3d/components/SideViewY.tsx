// src/features/polysphere-3d/components/SideViewY.tsx
import React from "react";
import type { PyramidBoard } from "../types";
import { LAYERS } from "../utils";
import { PIECE_COLOURS } from "../../polysphere-core/pieces";

interface SideViewProps {
  board: PyramidBoard;
  selectedLayer: number;
}

/**
 * SideViewY: look along the Y axis (rows).
 * For each (layer, col) we show the first non-empty cell along rows.
 * Each layer row has exactly `size` cells, centred horizontally.
 */
export function SideViewY({ board, selectedLayer }: SideViewProps) {
  type RowInfo = { layerIndex: number; cells: number[] };

  const rows: RowInfo[] = [];

  // Top layer first (visually), down to bottom
  for (let layerIndex = LAYERS.length - 1; layerIndex >= 0; layerIndex--) {
    const size = LAYERS[layerIndex];
    const layer = board[layerIndex];

    const cells: number[] = [];

    for (let colIndex = 0; colIndex < size; colIndex++) {
      let visiblePiece = 0;

      // look along rows: first non-zero wins
      for (let row = 0; row < size; row++) {
        const v = layer[row][colIndex];
        if (v > 0) {
          visiblePiece = v;
          break;
        }
      }

      cells.push(visiblePiece);
    }

    rows.push({ layerIndex, cells });
  }

  return (
    <div>
      <h4>Side view Y</h4>
      <div style={{ display: "grid", gap: 4 }}>
        {rows.map(({ layerIndex, cells }) => {
          const isSelectedLayer = layerIndex === selectedLayer;

          return (
            <div
              key={layerIndex}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {cells.map((pieceId, i) => {
                const colour =
                  pieceId > 0
                    ? (PIECE_COLOURS[pieceId] ?? "#ccc")
                    : "transparent";

                return (
                  <div
                    key={i}
                    style={{
                      width: 24,
                      aspectRatio: "1 / 1",
                      border:
                        "2px solid " + (isSelectedLayer ? "#000" : "#333"),
                      backgroundColor: colour,
                      borderRadius: 4,
                      cursor: "default",
                    }}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
