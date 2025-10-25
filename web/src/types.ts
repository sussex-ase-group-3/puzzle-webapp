export type BoardState = number[];           // arr[row]=col, -1 for empty
export type SolveRequest = { n: number; partial: BoardState; };
export type SolveResponse = { solutions: BoardState[]; };
