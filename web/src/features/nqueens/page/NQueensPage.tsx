import { useState } from "react";
import type { BoardState } from "../types";
import { fetchNQueenSolutions } from "../api";
import { Board } from "../components/Board";
import { Controls } from "../components/Controls";

export function NQueensPage() {
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
    setPartial((p) => {
      const next = [...p];
      next[row] = next[row] === col ? -1 : col; // one queen per row
      return next;
    });
  };

  const onSolve = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNQueenSolutions({ n, partial });
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        height: "100%",
        width: "100%",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>N-Queens</h1>

      <Controls
        n={n}
        setN={changeN}
        count={solutions.length}
        index={idx}
        prev={() =>
          setIdx((i) => (i - 1 + solutions.length) % solutions.length)
        }
        next={() => setIdx((i) => (i + 1) % solutions.length)}
        solve={onSolve}
        solving={loading}
      />

      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          width: "100%",
          position: "relative",
        }}
      >
        <Board
          n={n}
          placement={current ?? partial}
          editable={!hasSolutions}
          onToggle={onCellToggle}
        />
      </div>

      <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
        {!hasSolutions && !loading && (
          <p>Click Solve to get solutions for your partial board.</p>
        )}
        {hasSolutions && <p>{solutions.length} solution(s) found.</p>}
      </div>
    </div>
  );
}
