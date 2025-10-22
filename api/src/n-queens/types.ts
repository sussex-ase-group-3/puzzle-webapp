// Core type definitions for N-Queens solver

/**
 * Represents the state of an N-Queens board as a 1D array.
 * Index represents the row, value represents the column position of the queen.
 * A value of -1 indicates no queen is placed in that row.
 */
export type BoardState = number[];

/**
 * Represents a position on the board as a readonly tuple [row, col].
 */
export type Position = readonly [row: number, col: number];
