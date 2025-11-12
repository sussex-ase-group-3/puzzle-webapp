export type PolyBoard = number[][];

export type PolyPuzzleState = {
    board: PolyBoard; remainingPieces?: unknown
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
