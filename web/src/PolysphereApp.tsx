import {useState} from "react";

// PiecePalette Component
interface PiecePaletteProps {
    availablePieces: number[];
    selectedPiece: number | null;
    onPieceSelect: (pieceId: number) => void;
    onRotate: () => void;
}

function PiecePalette({availablePieces, selectedPiece, onPieceSelect, onRotate}: PiecePaletteProps) {
    return (
        <div style={{
            border: "2px solid #333",
            padding: "16px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px"
        }}>
            <h3 style={{marginTop: 0}}>Available Pieces</h3>
            <div style={{marginBottom: "12px"}}>
                <button
                    onClick={onRotate}
                    disabled={selectedPiece === null}
                    style={{
                        padding: "6px 12px",
                        backgroundColor: selectedPiece ? "#2196F3" : "#ccc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: selectedPiece ? "pointer" : "not-allowed",
                        fontSize: "12px"
                    }}
                >
                    ↻ Rotate Selected
                </button>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: "12px"
            }}>
                {availablePieces.map(pieceId => (
                    <div
                        key={pieceId}
                        onClick={() => onPieceSelect(pieceId)}
                        style={{
                            padding: "8px",
                            backgroundColor: selectedPiece === pieceId ? "#e3f2fd" : "#fff",
                            border: selectedPiece === pieceId ? "3px solid #2196F3" : "2px solid #999",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            minHeight: "80px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <div style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            marginBottom: "4px",
                            color: "#666"
                        }}>
                            Piece {pieceId}
                        </div>
                        {/* TODO: Fetch piece shape data from backend API and render it here */}
                        <div style={{fontSize: "12px", color: "#999"}}>
                            [Shape Preview]
                        </div>
                    </div>
                ))}
            </div>
            {availablePieces.length === 0 && (
                <p style={{color: "#666", fontStyle: "italic", textAlign: "center"}}>
                    All pieces placed!
                </p>
            )}
        </div>
    );
}

// PolysphereBoard Component
interface PolysphereBoardProps {
    board: number[][];
    editable?: boolean;
    onCellClick?: (row: number, col: number) => void;
}

function PolysphereBoard({
                             board,
                             editable = false,
                             onCellClick
                         }: PolysphereBoardProps) {
    const [hoverCell, setHoverCell] = useState<{ row: number, col: number } | null>(null);

    return (
        <div style={{display: "inline-block", border: "2px solid #333", padding: "10px", backgroundColor: "#fff"}}>
            {board.map((row, rowIndex) => (
                <div key={rowIndex} style={{display: "flex"}}>
                    {row.map((cell, colIndex) => {
                        const isHovered = hoverCell?.row === rowIndex && hoverCell?.col === colIndex;

                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => editable && onCellClick?.(rowIndex, colIndex)}
                                onMouseEnter={() => setHoverCell({row: rowIndex, col: colIndex})}
                                onMouseLeave={() => setHoverCell(null)}
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    border: "1px solid #999",
                                    backgroundColor: isHovered && editable ? "#f0f0f0" : "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: editable ? "pointer" : "default",
                                    fontWeight: "bold",
                                    fontSize: "10px",
                                    transition: "background-color 0.1s"
                                }}
                            >
                                {cell !== 0 ? cell : ""}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

// Main App
export default function PolysphereApp() {
    const EMPTY_BOARD = Array(5).fill(0).map(() => Array(11).fill(0));

    const [board, setBoard] = useState<number[][]>(EMPTY_BOARD);
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
    const [currentRotation, setCurrentRotation] = useState(0);

    // TODO: Fetch available pieces list from backend API
    const availablePieces = Array.from({length: 12}, (_, i) => i + 1);

    const handleCellClick = (row: number, col: number) => {
        // TODO: Implement cell click interaction logic
        if (selectedPiece !== null) {
            const newBoard = [...board];
            newBoard[row][col] = selectedPiece;
            setBoard(newBoard);
        }
        console.log(`Cell clicked at row: ${row}, col: ${col}`);
    };

    const handleRotate = () => {
        // TODO: Implement rotation logic
        setCurrentRotation((prev) => (prev + 1) % 4);
    };

    const handleReset = () => {
        // TODO: Call backend API to reset game state
        setBoard(EMPTY_BOARD);
        setSelectedPiece(null);
        setCurrentRotation(0);
    };

    const handleLoadSolution = () => {
        // TODO: Load solution from backend API
        console.log("Load solution");
    };

    const handleNextSolution = () => {
        // TODO: Fetch next solution from backend API
        console.log("Next solution");
    };

    return (
        <div style={{padding: "16px", maxWidth: "1200px", margin: "0 auto"}}>
            <h1>Polysphere</h1>
            <p style={{color: "#666", marginBottom: "24px"}}>
                Select a piece from the palette, rotate it if needed, then click on the board to place it.
                Click on placed pieces to remove them.
            </p>

            <div style={{marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap"}}>
                <button
                    onClick={handleReset}
                    style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        cursor: "pointer",
                        backgroundColor: "#f44336",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px"
                    }}
                >
                    Reset Board
                </button>
                <button
                    onClick={handleLoadSolution}
                    style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        cursor: "pointer",
                        backgroundColor: "#4CAF50",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px"
                    }}
                >
                    Load Solution
                </button>
                <button
                    onClick={handleNextSolution}
                    style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        cursor: "pointer",
                        backgroundColor: "#9C27B0",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px"
                    }}
                >
                    Next Solution
                </button>
                {selectedPiece && (
                    <span style={{
                        marginLeft: "16px",
                        padding: "8px 12px",
                        backgroundColor: "#e3f2fd",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}>
            Selected: Piece {selectedPiece} (Rotation: {currentRotation * 90}°)
          </span>
                )}
            </div>

            <div style={{display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px"}}>
                <div>
                    <h2 style={{marginTop: 0}}>Board</h2>
                    <PolysphereBoard
                        board={board}
                        editable={true}
                        onCellClick={handleCellClick}
                    />
                </div>

                <div>
                    <PiecePalette
                        availablePieces={availablePieces}
                        selectedPiece={selectedPiece}
                        onPieceSelect={(id) => setSelectedPiece(id)}
                        onRotate={handleRotate}
                    />
                </div>
            </div>
        </div>
    );
}