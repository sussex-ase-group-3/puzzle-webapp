// src/features/polysphere-3d/components/TopLayerView.tsx
import React, { useMemo, useState } from "react";
import type { PyramidBoard } from "../types";
import { LAYERS, getOrientedOffsets, piecesPresent3D } from "../utils";
import { PIECE_COLOURS } from "../../polysphere-core/pieces";

type SelectedPiece = {
  pieceId: number | null;
  turns: 0 | 1 | 2 | 3;
  flip: boolean;
};

interface TopLayerViewProps {
  board: PyramidBoard;
  selectedLayer: number;
  selectedPiece: SelectedPiece;
  onPlacePiece: (nextBoard: PyramidBoard) => void;
}

export function TopLayerView({
  board,
  selectedLayer,
  selectedPiece,
  onPlacePiece,
}: TopLayerViewProps) {
  const size = LAYERS[selectedLayer];
  const layer = board[selectedLayer];

  const [hoverPos, setHoverPos] = useState<{ row: number; col: number } | null>(
    null,
  );

  const presentPieces = useMemo(() => piecesPresent3D(board), [board]);

  /**
   * Compute ghost cells for the currently selected piece, anchored at hoverPos.
   * We only show a ghost if the placement would be valid (in-bounds + no overlap).
   */
  const { ghostCells, ghostValid } = useMemo(() => {
    const cells = new Set<string>();

    const { pieceId, turns, flip } = selectedPiece;
    if (
      !hoverPos ||
      pieceId == null ||
      presentPieces.has(pieceId) // don't show ghost if piece already placed
    ) {
      return { ghostCells: cells, ghostValid: false };
    }

    const offsets = getOrientedOffsets(pieceId, turns, flip);
    if (!offsets.length) return { ghostCells: cells, ghostValid: false };

    let valid = true;

    for (const [dr, dc] of offsets) {
      const r = hoverPos.row + dr;
      const c = hoverPos.col + dc;

      if (r < 0 || r >= size || c < 0 || c >= size) {
        valid = false;
        break;
      }
      if (board[selectedLayer][r][c] !== 0) {
        valid = false;
        break;
      }

      cells.add(`${r},${c}`);
    }

    return { ghostCells: cells, ghostValid: valid };
  }, [board, selectedLayer, selectedPiece, hoverPos, presentPieces, size]);

  function handleCellClick(row: number, col: number) {
    const { pieceId, turns, flip } = selectedPiece;
    if (pieceId == null) return;

    // Don't allow placing a piece that's already on the board
    if (presentPieces.has(pieceId)) {
      return;
    }

    const offsets = getOrientedOffsets(pieceId, turns, flip);
    if (!offsets.length) return;

    const targets: { layer: number; r: number; c: number }[] = [];

    for (const [dr, dc] of offsets) {
      const r = row + dr;
      const c = col + dc;

      if (r < 0 || r >= size || c < 0 || c >= size) {
        return; // invalid placement: off the edge
      }
      if (board[selectedLayer][r][c] !== 0) {
        return; // invalid placement: overlaps
      }

      targets.push({ layer: selectedLayer, r, c });
    }

    const next: PyramidBoard = board.map((layer) =>
      layer.map((rowArr) => [...rowArr]),
    );

    for (const { layer: L, r, c } of targets) {
      next[L][r][c] = pieceId;
    }

    onPlacePiece(next);
  }

  function handleCellRightClick(
    e: React.MouseEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) {
    e.preventDefault();
    const pieceId = board[selectedLayer][row][col];
    if (pieceId <= 0) return;

    // Remove *all* cells belonging to this piece across the whole pyramid
    const next: PyramidBoard = board.map((layer) =>
      layer.map((rowArr) => rowArr.map((v) => (v === pieceId ? 0 : v))),
    );

    onPlacePiece(next);
  }

  return (
    <div className="top-layer-view">
      <h3>Layer {selectedLayer}</h3>

      <div style={{ maxWidth: "260px" }}>
        <div
          className="top-layer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gap: "4px",
          }}
          onMouseLeave={() => setHoverPos(null)}
        >
          {layer.map((row, y) =>
            row.map((cell, x) => {
              const pieceId = cell;
              const hasRealPiece = pieceId > 0;
              const key = `${y},${x}`;
              const isGhost =
                ghostValid &&
                ghostCells.has(key) &&
                !hasRealPiece &&
                selectedPiece.pieceId != null;

              const realColour =
                hasRealPiece && PIECE_COLOURS[pieceId]
                  ? PIECE_COLOURS[pieceId]
                  : "transparent";

              const ghostColour =
                selectedPiece.pieceId != null
                  ? (PIECE_COLOURS[selectedPiece.pieceId] ?? "#ddd")
                  : "#ddd";

              const backgroundColor = hasRealPiece
                ? realColour
                : isGhost
                  ? ghostColour
                  : "transparent";

              const borderColor = isGhost && !ghostValid ? "red" : "#000";
              const borderStyle = isGhost && !hasRealPiece ? "dashed" : "solid";

              return (
                <button
                  key={key}
                  className="top-layer-cell"
                  onClick={() => handleCellClick(y, x)}
                  onContextMenu={(e) => handleCellRightClick(e, y, x)}
                  onMouseEnter={() => setHoverPos({ row: y, col: x })}
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    border: `1px ${borderStyle} ${borderColor}`,
                    backgroundColor,
                    borderRadius: "4px",
                    cursor: "pointer",
                    opacity: isGhost && !hasRealPiece ? 0.6 : 1,
                  }}
                >
                  {hasRealPiece ? pieceId : ""}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
