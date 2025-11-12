import React, { useState } from "react";

import type { BoardState } from "./types";
import { fetchSolutions } from "./api";
import { Board as QueensBoard } from "./components/Board";
import { Controls as QueensControls } from "./components/Controls";

import { BoardCanvas } from "./components/BoardCanvas";
import { SolvePanel } from "./components/SolvePanel";
import { PieceLab } from "./components/PieceLab";
import { Palette } from "./components/Palette";
import { usePuzzleStore } from "./store/usePuzzleStore";

type UIMode = "nqueens" | "polyhex";

export default function App() {
  const [n, setN] = useState(8);
  const [partial, setPartial] = useState<BoardState>(() => Array(8).fill(-1));
  const [solutions, setSolutions] = useState<BoardState[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeN = (v: number) => {
    const nv = Math.max(1, Math.min(20, Math.floor(v || 0)));
    setN(nv);
    setPartial(Array(nv).fill(-1));
    setSolutions([]);
    setIdx(0);
    setError(null);
  };

  const onCellToggle = (row: number, col: number) => {
    setPartial(p => {
      const next = [...p];
      next[row] = next[row] === col ? -1 : col;
      return next;
    });
  };

  const onSolve = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSolutions({ n, partial });
      setSolutions(data.solutions);
      setIdx(0);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setSolutions([]);
      setIdx(0);
    } finally {
      setLoading(false);
    }
  };

  const hasSolutions = solutions.length > 0;
  const current = hasSolutions ? solutions[idx] : null;

  const polyState = usePuzzleStore();
  usePuzzleStore(s => s.actions);

  const [mode, setMode] = useState<UIMode>("nqueens");

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Puzzle Suite</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            onClick={() => setMode("nqueens")}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: mode === "nqueens" ? "#111" : "#fff",
              color: mode === "nqueens" ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            N-Queens
          </button>
          <button
            onClick={() => setMode("polyhex")}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: mode === "polyhex" ? "#111" : "#fff",
              color: mode === "polyhex" ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            Polyhex
          </button>
        </div>
      </header>

      {mode === "nqueens" && (
        <div style={{ display: "grid", gap: 12 }}>
          <QueensControls
            n={n}
            setN={changeN}
            count={solutions.length}
            index={idx}
            prev={() =>
              setIdx(i => (solutions.length ? (i - 1 + solutions.length) % solutions.length : 0))
            }
            next={() =>
              setIdx(i => (solutions.length ? (i + 1) % solutions.length : 0))
            }
            solve={onSolve}
            solving={loading}
          />

          {error && <div style={{ color: "crimson" }}>{error}</div>}

          <QueensBoard
            n={n}
            placement={current ?? partial}
            editable={!hasSolutions}
            onToggle={onCellToggle}
          />

          {!hasSolutions && !loading && <p>Click Solve to get solutions for your partial board.</p>}
          {hasSolutions && <p>{solutions.length} solution(s) found.</p>}
        </div>
      )}

      {mode === "polyhex" && (
        <div style={{ display: "grid", gap: 16 }}>
          <SolvePanel />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <PieceLab />
              <Palette />
              <div style={{ fontSize: 12, color: "#555" }}>
                <p>Board {polyState.width} × {polyState.height}</p>
                <p>Hex size {polyState.hexSize}</p>
                <p>Mirror allowed {polyState.allowMirror ? "Yes" : "No"}</p>
                <p>Pieces {polyState.pieces.length}</p>
                <p>Pins {polyState.pins.length}</p>
                <p>Solutions {polyState.solutions.length}</p>
                <ul style={{ marginTop: 4 }}>
                  <li>Click board cells to toggle blocked cells</li>
                  <li>Draw a piece in Piece Lab and add it to the palette</li>
                  <li>Click a piece in the palette to add a pinned instance</li>
                  <li>Use Solve to search solutions</li>
                </ul>
              </div>
            </div>
            <div>
              <BoardCanvas />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
