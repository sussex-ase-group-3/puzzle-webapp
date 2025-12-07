// src/features/polysphere-3d/utils.ts
import type { PyramidBoard } from "./types";
import type { PieceId } from "../polysphere-core/pieceTypes";
import { ALL_PIECES } from "../polysphere-core/pieceTypes";

export const LAYERS = [5, 4, 3, 2, 1]; // size of each layer
export const ALL_PIECES_3D: PieceId[] = ALL_PIECES;

export function emptyPyramid(): PyramidBoard {
    return LAYERS.map(size =>
        Array.from({ length: size }, () =>
            Array.from({ length: size }, () => 0),
        ),
    );
}

export function piecesPresent3D(board: PyramidBoard): Set<PieceId> {
    const s = new Set<PieceId>();
    board.forEach(layer =>
        layer.forEach(row =>
            row.forEach(v => {
                if (v > 0) s.add(v);
            }),
        ),
    );
    return s;
}

export function remainingFromAllowed3D(
    allowed: PieceId[],
    board: PyramidBoard,
): PieceId[] {
    const present = piecesPresent3D(board);
    return allowed.filter(id => !present.has(id));
}
