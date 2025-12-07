// src/features/polysphere-3d/components/TopLayerView.tsx
import React from "react";
import type { PyramidBoard } from "../types";
import { LAYERS } from "../utils";
import { PIECE_COLOURS } from "../../polysphere-core/pieces"; // adjust path

type SelectedPiece = {
    pieceId: number | null;
    turns: number;
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
        if (!selectedPiece.pieceId) return;

        // MVP: just set this single cell
        const next = board.map((layer, l) =>
            layer.map((r, y) =>
                r.map((val, x) => {
                    if (l === selectedLayer && y === row && x === col) {
                        return selectedPiece.pieceId!;
                    }
                    return val;
                }),
            ),
        );

        onPlacePiece(next);
    }

// TopLayerView.tsx (render)
    return (
        <div className="top-layer-view">
            <h3>Layer {selectedLayer}</h3>

            <div style={{ maxWidth: "260px" }}>   {/* removed margin: "0 auto" */}
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
