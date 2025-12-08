import React from "react";
import type { PyramidBoard } from "../types";
import { LAYERS, getOrientedOffsets, piecesPresent3D } from "../utils";
import { PIECE_COLOURS } from "../../polysphere-core/pieces";

type SelectedPiece = {
    pieceId: number | null;
    turns: 0 | 1 | 2 | 3;   // tighten this type if needed
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

    function handleCellClick(row: number, col: number) {
        const { pieceId, turns, flip } = selectedPiece;
        if (!pieceId && pieceId !== 0) return;

        // Don't allow placing a piece that's already on the board
        const present = piecesPresent3D(board);
        if (present.has(pieceId)) {
            return;
        }

        const offsets = getOrientedOffsets(pieceId as number, turns as 0 | 1 | 2 | 3, flip);
        if (!offsets.length) return;

        // Compute all target cells for this orientation anchored at (row,col)
        const targets: { layer: number; r: number; c: number }[] = [];

        for (const [dr, dc] of offsets) {
            const r = row + dr;
            const c = col + dc;

            // Check in-bounds for this layer
            if (r < 0 || r >= size || c < 0 || c >= size) {
                return; // invalid placement: off the edge
            }

            if (board[selectedLayer][r][c] !== 0) {
                return; // invalid placement: overlaps existing piece
            }

            targets.push({ layer: selectedLayer, r, c });
        }

        // Apply placement: clone the board then fill targets
        const next: PyramidBoard = board.map((layer, l) =>
            layer.map((rowArr, r) => [...rowArr]),
        );

        for (const { layer: L, r, c } of targets) {
            next[L][r][c] = pieceId as number;
        }

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
                >
                    {layer.map((row, y) =>
                        row.map((cell, x) => {
                            const pieceId = cell;
                            const colour =
                                pieceId > 0 ? PIECE_COLOURS[pieceId] ?? "#ccc" : "transparent";

                            return (
                                <button
                                    key={`${y}-${x}`}
                                    className="top-layer-cell"
                                    onClick={() => handleCellClick(y, x)}
                                    style={{
                                        width: "100%",
                                        aspectRatio: "1 / 1",
                                        border: "1px solid #555",
                                        backgroundColor: colour,
                                        borderRadius: "4px",
                                    }}
                                >
                                    {pieceId > 0 ? pieceId : ""}
                                </button>
                            );
                        }),
                    )}
                </div>
            </div>
        </div>
    );
}
