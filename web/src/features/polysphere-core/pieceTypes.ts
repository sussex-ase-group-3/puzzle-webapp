// src/features/polysphere-core/pieceTypes.ts
export type PieceId = number;

export const ALL_PIECES: PieceId[] = Array.from(
    { length: 12 },
    (_, i) => i + 1,
);
