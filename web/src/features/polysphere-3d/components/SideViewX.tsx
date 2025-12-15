// src/features/polysphere-3d/components/SideViewX.tsx
import React from "react";
import type { PyramidBoard } from "../types";
import { LAYERS } from "../utils";
import { PIECE_COLOURS } from "../../polysphere-core/pieces";

interface SideViewProps {
  board: PyramidBoard;
  selectedLayer: number;
}

/**
 * SideViewX: look along the X axis (columns).
 * For each (layer, row) we show the first non-empty cell along columns.
 * Each layer row has exactly `size` cells, centred horizontally.
 */
export function SideViewX({ board, selectedLayer }: SideViewProps) {
  type RowInfo = { layerIndex: number; cells: number[] };

  const rows: RowInfo[] = [];

  // Top layer first (visually), down to bottom
  for (let layerIndex = LAYERS.length - 1; layerIndex >= 0; layerIndex--) {
    const size = LAYERS[layerIndex];
    const layer = board[layerIndex];

    const cells: number[] = [];

    for (let rowIndex = 0; rowIndex < size; rowIndex++) {
      const row = layer[rowIndex];
      let visiblePiece = 0;

      // look along columns: first non-zero wins
      for (let col = 0; col < size; col++) {
        const v = row[col];
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
      <h4>Side view X</h4>
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
