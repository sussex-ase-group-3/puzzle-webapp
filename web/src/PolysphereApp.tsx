import { useState, useEffect } from "react";

// TODO: Get color mapping configuration from backend API
function getColorForPiece(pieceId: number): string {
    // Temporary color mapping, will be fetched from API later
    const colors = [
        "#FF0000", "#00FF00", "#0000FF", "#FFFF00",
        "#FF00FF", "#00FFFF", "#FFA500", "#800080",
        "#FFC0CB", "#A52A2A", "#808080", "#000000"
    ];
    return colors[(pieceId - 1) % colors.length];
}

// TODO: Get shape rotation logic or pre-generated rotated shapes from backend API
function rotateShape(shape: number[][]): number[][] {
    return shape.map(([r, c]) => [c, -r]);
}

// TODO: Get list of placed pieces from backend API
function getPlacedPieces(board: number[][]): Set<number> {
    const placed = new Set<number>();
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            if (board[r][c] !== 0) placed.add(board[r][c]);
        }
    }
    return placed;
}

// TODO: Collision detection logic should be implemented in backend API
function canPlacePiece(
    board: number[][],
    shape: number[][],
    row: number,
    col: number
): boolean {
    // Placeholder - actual logic should be implemented in backend
    console.warn("canPlacePiece: Need to call backend API for collision detection");
    return true;
}

// TODO: Collision detection logic should be implemented in backend API
function placePiece(
    board: number[][],
    shape: number[][],
    row: number,
    col: number,
    pieceId: number
): number[][] {
    const newBoard = board.map(r => [...r]);
    for (const [dr, dc] of shape) {
        newBoard[row + dr][col + dc] = pieceId;
    }
    return newBoard;
}

// TODO: Get shape bounds calculation or pre-calculated bounds from backend API
function getShapeBounds(shape: number[][]) {
    const rows = shape.map(([r]) => r);
    const cols = shape.map(([, c]) => c);
    return {
        minRow: Math.min(...rows),
        maxRow: Math.max(...rows),
        minCol: Math.min(...cols),
        maxCol: Math.max(...cols)
    };
}

// PiecePalette Component
interface PiecePaletteProps {
    availablePieces: number[];
    selectedPiece: number | null;
    onPieceSelect: (pieceId: number) => void;
    onRotate: () => void;
    pieceShapes: { [key: number]: number[][] }; // TODO: Fetch from API
}

function PiecePalette({
                          availablePieces,
                          selectedPiece,
                          onPieceSelect,
                          onRotate,
                          pieceShapes
                      }: PiecePaletteProps) {
    return (
        <div style={{
            border: "2px solid #333",
            padding: "16px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px"
        }}>
            <h3 style={{ marginTop: 0 }}>Available Pieces</h3>
            <div style={{ marginBottom: "12px" }}>
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
                {availablePieces.map(pieceId => {
                    const shape = pieceShapes[pieceId];
                    if (!shape) return null;

                    const maxRow = Math.max(...shape.map(([r]) => r));
                    const maxCol = Math.max(...shape.map(([, c]) => c));
                    const minRow = Math.min(...shape.map(([r]) => r));
                    const minCol = Math.min(...shape.map(([, c]) => c));
                    const width = maxCol - minCol + 1;
                    const height = maxRow - minRow + 1;

                    return (
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
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${width}, 12px)`,
                                gap: "1px"
                            }}>
                                {Array.from({ length: height }, (_, r) =>
                                    Array.from({ length: width }, (_, c) => {
                                        const hasCell = shape.some(([sr, sc]) =>
                                            sr - minRow === r && sc - minCol === c
                                        );
                                        return (
                                            <div
                                                key={`${r}-${c}`}
                                                style={{
                                                    width: "12px",
                                                    height: "12px",
                                                    backgroundColor: hasCell ? getColorForPiece(pieceId) : "transparent",
                                                    border: hasCell ? "1px solid #333" : "none"
                                                }}
                                            />
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {availablePieces.length === 0 && (
                <p style={{ color: "#666", fontStyle: "italic", textAlign: "center" }}>
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
    previewShape?: number[][] | any;
    previewRow?: number;
    previewCol?: number;
    previewPieceId?: number;
    canPlace?: boolean;
}

function PolysphereBoard({
                             board,
                             editable = false,
                             onCellClick,
                             previewShape,
                             previewRow,
                             previewCol,
                             previewPieceId,
                             canPlace
                         }: PolysphereBoardProps) {
    const [hoverCell, setHoverCell] = useState<{row: number, col: number} | null>(null);

    const isPreviewCell = (row: number, col: number) => {
        if (!previewShape || previewRow === undefined || previewCol === undefined) return false;
        return previewShape.some(([dr, dc]: [number, number]) =>
            previewRow + dr === row && previewCol + dc === col
        );
    };

    return (
        <div style={{ display: "inline-block", border: "2px solid #333", padding: "10px", backgroundColor: "#fff" }}>
            {board.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: "flex" }}>
                    {row.map((cell, colIndex) => {
                        const isHovered = hoverCell?.row === rowIndex && hoverCell?.col === colIndex;
                        const isPreview = isPreviewCell(rowIndex, colIndex);

                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => editable && onCellClick?.(rowIndex, colIndex)}
                                onMouseEnter={() => setHoverCell({ row: rowIndex, col: colIndex })}
                                onMouseLeave={() => setHoverCell(null)}
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    border: "1px solid #999",
                                    backgroundColor: isPreview
                                        ? (canPlace ? getColorForPiece(previewPieceId!) : "#ff9999")
                                        : cell === 0
                                            ? (isHovered && editable ? "#f0f0f0" : "#fff")
                                            : getColorForPiece(cell),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: editable ? "pointer" : "default",
                                    fontWeight: "bold",
                                    fontSize: "10px",
                                    transition: "background-color 0.1s",
                                    opacity: isPreview ? 0.7 : 1
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
    const [previewPos, setPreviewPos] = useState<{row: number, col: number} | null>(null);
    const [solutionIndex, setSolutionIndex] = useState(0);

    // TODO: Fetch piece shapes data from backend API, replace the following data structure
    const pieceShapes: { [key: number]: number[][] } = {};

    const placedPieces = getPlacedPieces(board);
    const availablePieces = Array.from({ length: 12 }, (_, i) => i + 1)
        .filter(id => !placedPieces.has(id));

    const getCurrentShape = () => {
        if (!selectedPiece) return null;
        let shape = pieceShapes[selectedPiece];
        if (!shape) return null;
        for (let i = 0; i < currentRotation; i++) {
            shape = rotateShape(shape);
        }
        return shape;
    };

    const handleCellClick = (row: number, col: number) => {
        if (board[row][col] !== 0) {
            // TODO: Call backend API to remove piece
            const pieceToRemove = board[row][col];
            const newBoard = board.map(r => r.map(c => c === pieceToRemove ? 0 : c));
            setBoard(newBoard);
            return;
        }

        if (selectedPiece) {
            const shape = getCurrentShape();
            if (shape && canPlacePiece(board, shape, row, col)) {
                // TODO: Call backend API to verify placement is valid
                const newBoard = placePiece(board, shape, row, col, selectedPiece);
                setBoard(newBoard);
                setSelectedPiece(null);
                setCurrentRotation(0);
            }
        }
    };

    const handleRotate = () => {
        setCurrentRotation((prev) => (prev + 1) % 4);
    };

    const handleReset = () => {
        // TODO: Call backend API to reset game state
        setBoard(EMPTY_BOARD);
        setSelectedPiece(null);
        setCurrentRotation(0);
    };

    const handleLoadSolution = () => {
        // TODO: Load solution data from backend API (PREDEFINED_SOLUTIONS)
        console.log(`Load solution ${solutionIndex + 1}`);
        alert(`TODO: Load solution ${solutionIndex + 1} from backend API`);
    };

    const handleNextSolution = () => {
        // TODO: Get next solution from backend API
        const nextIndex = (solutionIndex + 1) % 2; // Assume there are 2 solutions
        setSolutionIndex(nextIndex);
    };

    const shape = getCurrentShape();
    const canPlace = previewPos && shape
        ? canPlacePiece(board, shape, previewPos.row, previewPos.col)
        : false;

    return (
        <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1>Polysphere</h1>
            <p style={{ color: "#666", marginBottom: "24px" }}>
                Select a piece from the palette, rotate it if needed, then click on the board to place it.
                Click on placed pieces to remove them.
            </p>

            <div style={{ marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                    Load Solution {solutionIndex + 1}
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

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px" }}>
                <div
                    onMouseMove={(e) => {
                        if (!selectedPiece) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const cellSize = 31;

                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const col = Math.floor(x / cellSize);
                        const row = Math.floor(y / cellSize);

                        const currentShape = getCurrentShape();
                        if (currentShape) {
                            const bounds = getShapeBounds(currentShape);

                            const adjustedRow = Math.max(0, Math.min(5 - (bounds.maxRow - bounds.minRow + 1), row - Math.floor((bounds.minRow + bounds.maxRow) / 2)));
                            const adjustedCol = Math.max(0, Math.min(11 - (bounds.maxCol - bounds.minCol + 1), col - Math.floor((bounds.minCol + bounds.maxCol) / 2)));

                            if (adjustedRow >= 0 && adjustedRow < 5 && adjustedCol >= 0 && adjustedCol < 11) {
                                setPreviewPos({ row: adjustedRow, col: adjustedCol });
                            } else {
                                setPreviewPos(null);
                            }
                        }
                    }}
                    onMouseLeave={() => setPreviewPos(null)}
                >
                    <h2 style={{ marginTop: 0 }}>Board</h2>
                    <PolysphereBoard
                        board={board}
                        editable={true}
                        onCellClick={handleCellClick}
                        previewShape={selectedPiece ? shape : undefined}
                        previewRow={previewPos?.row}
                        previewCol={previewPos?.col}
                        previewPieceId={selectedPiece || undefined}
                        canPlace={canPlace}
                    />
                </div>

                <div>
                    <PiecePalette
                        availablePieces={availablePieces}
                        selectedPiece={selectedPiece}
                        onPieceSelect={(id) => {
                            setSelectedPiece(id);
                            setCurrentRotation(0);
                        }}
                        onRotate={handleRotate}
                        pieceShapes={pieceShapes}
                    />
                </div>
            </div>
        </div>
    );
}