// src/features/polysphere-3d/page/Polysphere3DPage.tsx
import React, { useMemo, useState } from "react";
import type { PyramidBoard } from "../types";
import { emptyPyramid, piecesPresent3D } from "../utils";
import { TopLayerView } from "../components/TopLayerView";
import { SideViewX } from "../components/SideViewX";
import { SideViewY } from "../components/SideViewY";
import { PiecePalette } from "../../polysphere-core/components/PiecePalette";

export function Polysphere3DPage() {
    const [board, setBoard] = useState<PyramidBoard>(() => emptyPyramid());
    const [selectedLayer, setSelectedLayer] = useState(0);

    const [selectedPieceId, setSelectedPieceId] = useState<number>(1);
    const [turns, setTurns] = useState<0 | 1 | 2 | 3>(0);
    const [flip, setFlip] = useState<boolean>(false);

    const disabledIds = useMemo(
        () => new Set(piecesPresent3D(board)),
        [board],
    );

    return (
        <div style={{ display: "grid", gap: 16 }}>
            {/* Header (no slider now) */}
            <section>
                <h2>Polysphere 3D</h2>
                <p>
                    Use the top view and palette to define a partial configuration, then
                    solve for completions.
                </p>
            </section>

            {/* Main 2-column layout */}
            <section
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
                    gap: 24,
                    alignItems: "flex-start",
                }}
            >
                {/* Input area: layer slider + top-layer + palette */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 12,
                        display: "grid",
                        gap: 12,
                    }}
                >
                    <h3>Build partial configuration</h3>

                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span>Layer:</span>
                        <input
                            type="range"
                            min={0}
                            max={4}
                            value={selectedLayer}
                            onChange={e => setSelectedLayer(Number(e.target.value))}
                        />
                        <span>{selectedLayer}</span>
                    </label>

                    <TopLayerView
                        board={board}
                        selectedLayer={selectedLayer}
                        selectedPiece={{ pieceId: selectedPieceId, turns, flip }}
                        onPlacePiece={setBoard}
                    />

                    <div>
                        <PiecePalette
                            selected={selectedPieceId}
                            setSelected={setSelectedPieceId}
                            turns={turns}
                            setTurns={setTurns}
                            flip={flip}
                            setFlip={setFlip}
                            disabledIds={disabledIds}
                        />
                    </div>

                    <small style={{ color: "#555" }}>
                        Tip: only this top-down view is used for placing pieces. Side views
                        are for visualisation only.
                    </small>
                </div>

                {/* Side views: read-only */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 12,
                        display: "grid",
                        gap: 12,
                    }}
                >
                    <h3>Side views (read-only)</h3>
                    <p style={{ fontSize: "0.9rem", color: "#555" }}>
                        These projections show the puzzle from two sides. You can’t place pieces here.
                    </p>

                    <SideViewX board={board} selectedLayer={selectedLayer} />
                    <SideViewY board={board} selectedLayer={selectedLayer} />
                </div>
            </section>
        </div>
    );
}
