// web/src/App.tsx
import { useState } from "react";
import { NQueensPage } from "./features/nqueens/page/NQueensPage";
import { PolyspherePage } from "./features/polysphere/page/PolyspherePage";
import { Polysphere3DPage } from "./features/polysphere-3d/page/Polysphere3DPage";

type Tab = "nqueens" | "polysphere" | "polysphere3d";

export default function App() {
    const [tab, setTab] = useState<Tab>("nqueens");

    return (
        <div style={{ padding: 16, display: "grid", gap: 12 }}>
            <nav style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={() => setTab("nqueens")}
                    aria-pressed={tab === "nqueens"}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        background: tab === "nqueens" ? "#eef" : "#fff",
                    }}
                >
                    N-Queens
                </button>
                <button
                    onClick={() => setTab("polysphere")}
                    aria-pressed={tab === "polysphere"}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        background: tab === "polysphere" ? "#eef" : "#fff",
                    }}
                >
                    Polysphere
                </button>
                <button
                    onClick={() => setTab("polysphere3d")}
                    aria-pressed={tab === "polysphere3d"}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        background: tab === "polysphere3d" ? "#eef" : "#fff",
                    }}
                >
                    Polysphere 3D
                </button>

            </nav>

            {tab === "nqueens" && <NQueensPage />}
            {tab === "polysphere" && <PolyspherePage />}
            {tab === "polysphere3d" && <Polysphere3DPage />}

        </div>
    );
}
