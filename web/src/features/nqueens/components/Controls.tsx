export function Controls({
  n, setN, count, index, prev, next, solve, solving
}: {
  n: number; setN: (v: number) => void;
  count: number; index: number;
  prev: () => void; next: () => void;
  solve: () => void; solving: boolean;
}) {

  // Shared button style
  const btn: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #1b353c",
    background: "#1b353c",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    transition: "0.2s",
  };

  const btnDisabled: React.CSSProperties = {
    ...btn,
    background: "#3d5e66",
    borderColor: "#3d5e66",
    cursor: "default",
    opacity: 0.6,
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "12px 16px",
        marginTop: 12,
        marginBottom: 20,     // 👈 extra space for the board
        background: "#f5f5f5",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
      }}
    >
      <label style={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
        N:
        <input
          type="number"
          min={1}
          max={20}
          value={n}
          onChange={e => setN(+e.target.value)}
          style={{
            width: 72,
            marginLeft: 8,
            padding: "6px 8px",
            borderRadius: "6px",
            border: "1px solid #aaa",
            fontWeight: 600
          }}
        />
      </label>

      <button
        onClick={solve}
        disabled={solving}
        style={solving ? btnDisabled : btn}
        onMouseEnter={e => !solving && (e.currentTarget.style.background = "#254952")}
        onMouseLeave={e => !solving && (e.currentTarget.style.background = "#1b353c")}
      >
        {solving ? "Solving…" : "Solve"}
      </button>

      <button
        onClick={prev}
        disabled={!count}
        style={!count ? btnDisabled : btn}
        onMouseEnter={e => count && (e.currentTarget.style.background = "#254952")}
        onMouseLeave={e => count && (e.currentTarget.style.background = "#1b353c")}
      >
        Prev
      </button>

      <button
        onClick={next}
        disabled={!count}
        style={!count ? btnDisabled : btn}
        onMouseEnter={e => count && (e.currentTarget.style.background = "#254952")}
        onMouseLeave={e => count && (e.currentTarget.style.background = "#1b353c")}
      >
        Next
      </button>

      <span style={{ marginLeft: 8, fontWeight: 600 }}>
        {count ? `Solution ${index + 1}/${count}` : "No solutions yet"}
      </span>
    </div>
  );
}
