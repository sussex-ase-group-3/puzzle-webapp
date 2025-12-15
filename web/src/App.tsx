// web/src/App.tsx
import { useState } from "react";
import { NQueensPage } from "./features/nqueens/page/NQueensPage";
import { PolyspherePage } from "./features/polysphere/page/PolyspherePage";
import { Polysphere3DPage } from "./features/polysphere-3d/page/Polysphere3DPage";

type Tab = "nqueens" | "polysphere" | "polysphere3d";

export default function App() {
  const [tab, setTab] = useState<Tab>("nqueens");

  return (
    <div
      className="app-container"
      style={{
        background: "linear-gradient(145deg, #000000ff, #e4ebf5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: 0,
        padding: 0,
        width: "100vw",
        minHeight: "100vh",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      {/* GLOBAL CSS */}
      <style>
        {`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          max-height: 100vh;
          overflow-y: auto;
        }

        body {
          background: transparent;
        }

        #root {
          margin: 0;
          padding: 0;
        }

        :root {
          --accent: #18212dff;
          --title-size: 24px;
          --tab-padding: 8px 16px;
          --tab-gap: 12px;
          --page-padding: 16px;

        }

        .board {
          display: grid;
          gap: 2px;
          background:#1f2937;
          padding:8px;
          border-radius:12px;
          width: fit-content;
          max-width: 95vw;
        }

        .cell {
          aspect-ratio: 1;
          display:flex;
          justify-content:center;
          align-items:center;
          font-weight:700;
          border-radius:6px;
          min-width: 20px;
          min-height: 20px;
        }

        .cell.light { background:#fefefe; }
        .cell.dark { background:#1b353c; color:white; }
        .queen { font-size:22px; }

        button {
          transition: all 0.2s;
        }

        .app-title {
          font-size: var(--title-size);
          font-weight: bold;
          color: #052b2dff;
          margin-bottom: 24px;
          text-align: center;
          text-shadow: 1px 2px 4px #01eafbfd;
        }

        .tab-nav {
          display: flex;
          gap: var(--tab-gap);
          margin-bottom: 32px;
          background: #ffffff;
          border: 2px solid #0f1010ff;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 2px 10px 25px rgba(4, 181, 245, 0.27);
          flex-wrap: wrap;
          justify-content: center;
        }

        .tab-button {
          padding: var(--tab-padding);
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .page-area {
          width: fit-content;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 0;
        }



        /* Large screens - scale everything down */
        @media (min-width: 1800px) {
          :root {
            --title-size: 28px;
            --tab-padding: 8px 18px;
            --tab-gap: 10px;
            --page-padding: 18px;

          }
        }

        /* Medium-large screens */
        @media (max-width: 1400px) {
          :root {
            --title-size: 22px;
            --tab-padding: 7px 14px;
            --tab-gap: 10px;
            --page-padding: 14px;

          }
        }

        /* Medium screens */
        @media (max-width: 1024px) {
          :root {
            --title-size: 20px;
            --tab-padding: 6px 12px;
            --tab-gap: 8px;
            --page-padding: 12px;

          }
        }

        /* Small screens */
        @media (max-width: 768px) {
          :root {
            --title-size: 18px;
            --tab-padding: 5px 10px;
            --tab-gap: 6px;
            --page-padding: 10px;

          }

          .tab-nav {
            flex-direction: column;
            align-items: stretch;
          }

          .tab-button {
            text-align: center;
          }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
          :root {
            --title-size: 16px;
            --tab-padding: 4px 8px;
            --tab-gap: 4px;
            --page-padding: 8px;

          }
        }
      `}
      </style>

      {/* TITLE */}
      <h1 className="app-title">Puzzle Game Hub</h1>

      {/* TAB NAVIGATION */}
      <div className="tab-nav">
        {(["nqueens", "polysphere", "polysphere3d"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className="tab-button"
            style={{
              background: tab === t ? "var(--accent)" : "#ffffffff",
              color: tab === t ? "#ffffff" : "#2a3544ff",
              boxShadow:
                tab === t
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
            {t === "nqueens"
              ? "N-Queens"
              : t === "polysphere"
                ? "Polysphere"
                : "Polysphere 3D"}
          </button>
        ))}
      </div>

      {/* PAGE AREA */}
      <div className="page-area">
        {tab === "nqueens" && <NQueensPage />}
        {tab === "polysphere" && <PolyspherePage />}
        {tab === "polysphere3d" && <Polysphere3DPage />}
      </div>
    </div>
  );
}
