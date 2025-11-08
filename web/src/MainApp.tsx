import { useState } from "react";
import App from "./App";
import PolysphereApp from "./PolysphereApp";

export default function MainApp() {
    const [currentView, setCurrentView] = useState<"nqueens" | "polysphere">("nqueens");

    return (
        <div>
            <div style={{
                padding: "16px",
                backgroundColor: "#f0f0f0",
                borderBottom: "1px solid #ccc"
            }}>
                <button
                    onClick={() => setCurrentView("nqueens")}
                    style={{
                        padding: "8px 16px",
                        marginRight: "8px",
                        backgroundColor: currentView === "nqueens" ? "#007bff" : "#e0e0e0",
                        color: currentView === "nqueens" ? "white" : "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    N-Queens
                </button>
                <button
                    onClick={() => setCurrentView("polysphere")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: currentView === "polysphere" ? "#007bff" : "#e0e0e0",
                        color: currentView === "polysphere" ? "white" : "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Polysphere
                </button>
            </div>

            <div style={{ padding: "16px" }}>
                {currentView === "nqueens" ? <App /> : <PolysphereApp />}
            </div>
        </div>
    );
}