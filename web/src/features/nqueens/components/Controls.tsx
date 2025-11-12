export function Controls({
  n, setN, count, index, prev, next, solve, solving
}: {
  n: number; setN: (v: number) => void;
  count: number; index: number;
  prev: () => void; next: () => void;
  solve: () => void; solving: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <label>
        N:
        <input
          type="number"
          min={1} max={20}
          value={n}
          onChange={e => setN(+e.target.value)}
          style={{ width: 72, marginLeft: 6 }}
        />
      </label>
      <button onClick={solve} disabled={solving}>
        {solving ? "Solving…" : "Solve"}
      </button>
      <button onClick={prev} disabled={!count}>Prev</button>
      <button onClick={next} disabled={!count}>Next</button>
      <span>{count ? `Solution ${index + 1}/${count}` : "No solutions yet"}</span>
    </div>
  );
}
