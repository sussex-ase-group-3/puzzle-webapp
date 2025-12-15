// src/features/polysphere-3d/page/Polysphere3DPage.tsx
import React, { useMemo, useState, useCallback } from "react";
import type { PyramidBoard } from "../types";
import {
  emptyPyramid,
  piecesPresent3D,
  remainingFromAllowed3D,
  ALL_PIECES_3D,
  convertSolutionToBoard,
} from "../utils";
import { TopLayerView } from "../components/TopLayerView";
import { SideViewX } from "../components/SideViewX";
import { SideViewY } from "../components/SideViewY";
import { PiecePalette } from "../../polysphere-core/components/PiecePalette";
import {
  startPolysphere3DSolver,
  getNext3DSolutions,
  cancelPolysphere3DSolver,
} from "../api";

export function Polysphere3DPage() {
  const [board, setBoard] = useState<PyramidBoard>(() => emptyPyramid());
  const [selectedLayer, setSelectedLayer] = useState(0);

  const [selectedPieceId, setSelectedPieceId] = useState<number>(1);
  const [turns, setTurns] = useState<0 | 1 | 2 | 3>(0);
  const [flip, setFlip] = useState<boolean>(false);

  // Solver state
  const [isSolving, setIsSolving] = useState(false);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const [solverError, setSolverError] = useState<string | null>(null);
  const [solverStats, setSolverStats] = useState({ found: 0, max: -1 });

  const disabledIds = useMemo(() => new Set(piecesPresent3D(board)), [board]);

  const handleSolve = async () => {
    try {
      setIsSolving(true);
      setSolverError(null);
      setSolutions([]);
      setCurrentSolutionIndex(0);

      const remainingPieces = remainingFromAllowed3D(ALL_PIECES_3D, board);

      await startPolysphere3DSolver({
        board,
        remainingPieces,
        maxSolutions: 10, // Limit to first 10 solutions
      });

      // Get first batch of solutions
      const response = await getNext3DSolutions(5);
      setSolutions(response.solutions);
      setSolverStats({
        found: response.foundSolutions,
        max: response.maxSolutions,
      });

      if (response.solutions.length > 0) {
        setCurrentSolutionIndex(0);
        // Auto-load the first solution
        const firstSolutionBoard = convertSolutionToBoard(
          response.solutions[0],
        );
        setBoard(firstSolutionBoard);
      }
    } catch (error) {
      setSolverError(error instanceof Error ? error.message : "Solver failed");
    } finally {
      setIsSolving(false);
    }
  };

  const handleCancelSolver = async () => {
    try {
      await cancelPolysphere3DSolver();
      setIsSolving(false);
      setSolutions([]);
      setCurrentSolutionIndex(0);
    } catch (error) {
      console.error("Failed to cancel solver:", error);
    }
  };

  const handleLoadSolution = (index: number) => {
    if (solutions[index]) {
      setCurrentSolutionIndex(index);
      const convertedBoard = convertSolutionToBoard(solutions[index]);
      setBoard(convertedBoard);
    }
  };

  const handlePreviousSolution = () => {
    if (currentSolutionIndex > 0) {
      handleLoadSolution(currentSolutionIndex - 1);
    }
  };

  const handleNextSolution = () => {
    if (currentSolutionIndex < solutions.length - 1) {
      handleLoadSolution(currentSolutionIndex + 1);
    }
  };

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
            border: "2px solid #333",
            borderRadius: 8,
            padding: 12,
            display: "grid",
            gap: 12,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
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
              onChange={(e) => setSelectedLayer(Number(e.target.value))}
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

          <small style={{ color: "#222", fontWeight: "500" }}>
            Tip: only this top-down view is used for placing pieces. Side views
            are for visualisation only.
          </small>

          {/* Solver Controls */}
          <div
            style={{
              marginTop: 16,
              borderTop: "1px solid #ccc",
              paddingTop: 12,
            }}
          >
            <h4>Solver</h4>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <button
                onClick={handleSolve}
                disabled={isSolving}
                style={{
                  padding: "8px 16px",
                  backgroundColor: isSolving ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: isSolving ? "not-allowed" : "pointer",
                }}
              >
                {isSolving ? "Solving..." : "Solve Puzzle"}
              </button>

              {isSolving && (
                <button
                  onClick={handleCancelSolver}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

            {solverError && (
              <div
                style={{
                  color: "#dc3545",
                  fontSize: "0.9rem",
                  marginBottom: 8,
                }}
              >
                Error: {solverError}
              </div>
            )}

            {solverStats.found > 0 && (
              <div style={{ fontSize: "0.9rem", marginBottom: 8 }}>
                Found {solverStats.found} solution
                {solverStats.found !== 1 ? "s" : ""}
                {solverStats.max !== -1 && ` (max: ${solverStats.max})`}
              </div>
            )}

            {solutions.length > 0 && (
              <div>
                <div style={{ marginBottom: 8, fontSize: "0.9rem" }}>
                  Solution {currentSolutionIndex + 1} of {solutions.length}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handlePreviousSolution}
                    disabled={currentSolutionIndex === 0}
                    style={{
                      padding: "6px 12px",
                      backgroundColor:
                        currentSolutionIndex === 0 ? "#ccc" : "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor:
                        currentSolutionIndex === 0 ? "not-allowed" : "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNextSolution}
                    disabled={currentSolutionIndex === solutions.length - 1}
                    style={{
                      padding: "6px 12px",
                      backgroundColor:
                        currentSolutionIndex === solutions.length - 1
                          ? "#ccc"
                          : "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor:
                        currentSolutionIndex === solutions.length - 1
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side views: read-only */}
        <div
          style={{
            border: "2px solid #333",
            borderRadius: 8,
            padding: 12,
            display: "grid",
            gap: 12,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <h3>Side views (read-only)</h3>
          <p style={{ fontSize: "0.9rem", color: "#222", fontWeight: "500" }}>
            These projections show the puzzle from two sides. You can’t place
            pieces here.
          </p>

          <SideViewX board={board} selectedLayer={selectedLayer} />
          <SideViewY board={board} selectedLayer={selectedLayer} />
        </div>
      </section>
    </div>
  );
}
