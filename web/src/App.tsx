import { useState } from "react";
import type { BoardState } from "./types";
import { fetchSolutions } from "./api";
import { Board } from "./components/Board";
import { Controls } from "./components/Controls";

export default function App() {
  const [n, setN] = useState(8);
  const [partial, setPartial] = useState<BoardState>(() => Array(8).fill(-1));
  const [solutions, setSolutions] = useState<BoardState[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // when N changes, reset board and selection
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
      next[row] = (next[row] === col) ? -1 : col; // max one queen per row
      return next;
    });
  };

  const onSolve = async () => {
    setLoading(true); setError(null);
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

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1>N-Queens</h1>

      <Controls
        n={n}
        setN={changeN}
        count={solutions.length}
        index={idx}
        prev={() => setIdx(i => (i - 1 + solutions.length) % solutions.length)}
        next={() => setIdx(i => (i + 1) % solutions.length)}
        solve={onSolve}
        solving={loading}
      />

      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <Board
        n={n}
        placement={current ?? partial}
        editable={!hasSolutions}    // lock board when viewing a solution (optional)
        onToggle={onCellToggle}
      />

      {!hasSolutions && !loading && <p>Click Solve to get solutions for your partial board.</p>}
      {hasSolutions && <p>{solutions.length} solution(s) found.</p>}
    </div>
  );
}
