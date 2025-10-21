# Data Model

This document details the data model we will use for representing and solving the N-Queens problem.

## Board State

There are a couple of obvious options for board state.

### Simple array of {row, col} co-ordinate objects

This would be the most obvious choice, there would be n objects in the array.

### 2D array representing the entire board

This would be incredibly wasteful and might actually make solving it more complicated as well, so this should be avoided.

### 1D array where arr[row] = col represents a point at {row, col}

This is slightly less intuitive than an array of {row, col} objects but is a perfectly fine and more efficient representation. This works because you know there can't be 2 queens in the same row. This would be my preferred approach.

## Solver State

The problem lends itself well to recursion. It would be very simple to just simulate placing a queen and prune any branches that are impossible.

Using this method, the solver would need `n`, the current board state and maybe a collection containing the solutions found so far.

We could also potentially improve it further by pruning board states that are symmetrical to or rotations of known board states (explored state tracking).

### Core types and functions

```ts
type BoardState<N extends number> = number[] & { length: N };
type Position = readonly [row: number, col: number];

function placeQueen(boardState: BoardState, newPosition: Position): BoardState

function isSafe(boardState: BoardState, newPosition: Position): boolean

function isComplete(boardState: BoardState): boolean

function rotateBoard(boardState: BoardState): BoardState

function flipBoard(boardState: BoardState): BoardState

function wasPreviouslyComputed(boardState: BoardState, visitedSet: Set): boolean

function recordExploredState(boardState: BoardState, visitedSet: Set): void
```

These should all be necessary to effectively and efficiently solve this problem.
To make the general control flow clear in pseudocode:

```
solve:
  if current board state exists in visited set, return empty set

  store current board state and all 7 symmetric variants in visited set

  if board is complete, return current state and all 7 symmetric variants

  for each valid queen placement in next position:
    add solve(board + placement) to results

  return combined results
  ```
