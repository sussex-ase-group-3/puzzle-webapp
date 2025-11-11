// web/src/types.ts
// N-Queens
export type BoardState = number[];           // arr[row] = col, -1 for empty
export type SolveRequest = { n: number; partial: BoardState; };
export type SolveResponse = { solutions: BoardState[]; };

// Polysphere (assumptions: 2D array board; 0 = empty, >0 = piece id)
export type PolyBoard = number[][];

export type PolyPuzzleState = {
    board: PolyBoard;
    // The API may return remainingPieces as an array or object; we don't rely on it for rendering.
    remainingPieces?: number[] | { [k: string]: unknown } | null;
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
