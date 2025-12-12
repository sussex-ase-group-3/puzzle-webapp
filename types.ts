export type PolyBoard = number[][];

export type PolyPuzzleState = {
    board: PolyBoard;
    remainingPieces?: unknown;
};

export type PolyStartRequest = {
    board?: PolyBoard;
    remainingPieces?: number[]; // piece ids 1..12 if using all
    maxSolutions?: number;
};

export type PolyNextResponse = {
    solutions: PolyPuzzleState[];
    isComplete: boolean;
    foundSolutions: number;
    maxSolutions: number;
};

// 3D Pyramid types
export interface PyramidCell {
    layer: number;
    row: number;
    col: number;
    pieceId: number; // 0 for empty, >0 for piece
}

export type PyramidBoard = PyramidCell[][][]; // [layer][row][col]

export interface PyramidSolution {
    pyramid: PyramidBoard;
    stats?: SolverStats;
}

export interface SolverStats {
    time: number;          // milliseconds
    nodesVisited: number;  // number of nodes visited
    backtracks: number;    // backtrack count
    memoryUsage: number;   // bytes used
}

// 3D Solver Parameters
export interface PyramidStartRequest extends PolyStartRequest {
    measureStats?: boolean; // whether to collect solver statistics
    pyramidLayers?: number; // number of pyramid layers, default: 5
}

export interface PyramidNextResponse {
    solutions: PyramidSolution[];
    isComplete: boolean;
    foundSolutions: number;
    maxSolutions: number;
    stats?: SolverStats; // overall solver statistics if measureStats was true
}

// Drag and drop payload type
export interface DragPayload {
    pieceId: number;
    turns: 0 | 1 | 2 | 3;
    flip: boolean;
}

// Event stream batch type
export interface BatchEvent {
    solutions: PolyPuzzleState[] | PyramidSolution[];
    batchNumber: number;
    totalSoFar: number;
}