// src/features/polysphere-3d/types.ts

import type { PieceId } from "../polysphere-core/pieceTypes";

// [layer][row][col]
export type PyramidBoard = number[][][];

export type Poly3DPuzzleState = {
    board: PyramidBoard;
    remainingPieces?: PieceId[];
};

export type Poly3DStartRequest = {
    board?: PyramidBoard;
    remainingPieces?: PieceId[];
    maxSolutions?: number;
};

export type Poly3DNextResponse = {
    solutions: Poly3DPuzzleState[];
    isComplete: boolean;
    foundSolutions: number;
    maxSolutions: number;
};
