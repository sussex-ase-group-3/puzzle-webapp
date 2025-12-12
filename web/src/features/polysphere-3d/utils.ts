// src/features/polysphere-3d/utils.ts
import type { PyramidBoard } from "./types";
import type { PieceId } from "../polysphere-core/pieceTypes";
import { ALL_PIECES } from "../polysphere-core/pieceTypes";
import {
    PIECE_SHAPES,
    toOffsets,
    type BoolGrid,
} from "../polysphere-core/pieces";

export const LAYERS = [5, 4, 3, 2, 1]; // size of each layer
export const ALL_PIECES_3D: PieceId[] = ALL_PIECES;

export function emptyPyramid(): PyramidBoard {
    return LAYERS.map(size =>
        Array.from({ length: size }, () =>
            Array.from({ length: size }, () => 0),
        ),
    );
}

// Scan any 3D board and see which piece IDs are present
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

/**
 * --- Orientation helpers for placing a piece in XY on a single layer ---
 */

// Rotate a BoolGrid 90° clockwise
function rotate90(shape: BoolGrid): BoolGrid {
    const rows = shape.length;
    const cols = shape[0].length;
    const out: BoolGrid = Array.from({ length: cols }, () =>
        Array<boolean>(rows).fill(false),
    );
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (shape[r][c]) {
                out[c][rows - 1 - r] = true;
            }
        }
    }
    return out;
}

// Apply 0–3 quarter turns
function rotateShape(shape: BoolGrid, turns: 0 | 1 | 2 | 3): BoolGrid {
    let g = shape;
    for (let i = 0; i < turns; i++) {
        g = rotate90(g);
    }
    return g;
}

// Flip horizontally (mirror columns)
function flipShape(shape: BoolGrid): BoolGrid {
    return shape.map(row => [...row].reverse());
}

/**
 * Get oriented [dr, dc] offsets for a piece given rotation + flip.
 * dr,dc are relative to an anchor cell; we normalise so min dr/min dc = 0.
 */
export function getOrientedOffsets(
    pieceId: PieceId,
    turns: 0 | 1 | 2 | 3,
    flip: boolean,
): [number, number][] {
    let shape = PIECE_SHAPES[pieceId];
    if (!shape || shape.length === 0) return [];

    if (flip) {
        shape = flipShape(shape);
    }
    shape = rotateShape(shape, turns);

    // toOffsets normalises to (0,0)-based offsets
    const offsets = toOffsets(shape);
    return offsets as [number, number][];
}
