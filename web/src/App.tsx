// web/src/App.tsx
import { useState } from "react";
import { NQueensPage } from "./features/nqueens/page/NQueensPage";
import { PolyspherePage } from "./features/polysphere/page/PolyspherePage";

type Tab = "nqueens" | "polysphere";

export default function App() {
  const [tab, setTab] = useState<Tab>("nqueens");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #000000ff, #e4ebf5)",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      {/* GLOBAL CSS */}
      <style>
        {`
        :root {
          --cell-size: 44px;
          --accent: #18212dff;
        }

        .board {
          display: grid;
          gap: 2px;
          background:#1f2937;
          padding:8px;
          border-radius:12px;
        }

        .cell {
          width: var(--cell-size);
          height: var(--cell-size);
          display:flex;
          justify-content:center;
          align-items:center;
          font-weight:700;
          border-radius:6px;
        }

        .cell.light { background:#fefefe; }
        .cell.dark { background:#1b353c; color:white; }
        .queen { font-size:22px; }

        button {
          transition: all 0.2s;
        }
      `}
      </style>

      {/* TITLE */}
      <h1
        style={{
          fontSize: 36,
          fontWeight: "bold",
          color: "#052b2dff",
          marginBottom: 24,
          textAlign: "center",
          textShadow: "1px 2px 4px #01eafbfd",
        }}
      >
        Puzzle Game Hub
      </h1>

      {/* TAB NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 32,
          background: "#ffffff",
          border: "2px solid #0f1010ff",
          borderRadius: 16,
          padding: 8,
          boxShadow: "2px 10px 25px rgba(4, 181, 245, 0.27)",
        }}
      >
        {(["nqueens", "polysphere"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: tab === t ? "var(--accent)" : "#ffffffff",
              color: tab === t ? "#ffffff" : "#2a3544ff",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: tab === t
                ? "2px 2px 6px #01eafbfd"
                : "2px 2px 6px rgba(255, 0, 0, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {t === "nqueens" ? "N-Queens" : "Polysphere"}
          </button>
        ))}
      </div>

      {/* PAGE AREA */}
      <div
        style={{
          width: "fit-content",
          padding: 24,
          borderRadius: 16,
          background: "#ffffffff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          transition: "all 0.3s",
        }}
      >
        {tab === "nqueens" ? <NQueensPage /> : <PolyspherePage />}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 48,
          fontSize: 14,
          color: "#000000ff",
          textAlign: "center",
        }}
      >
        Powered by React & Dancing Links Algorithm
      </footer>
    </div>
  );
}
