# Data Model

This document details a data model for representing and solving the Polysphere packing puzzle on a 5x11 board.
The fact that these are polyspheres doesn't actually change anything - treat them like squares.

## Board Representation

### 2D Array

A 2D array is the simplest representation. We use different numerical IDs for each piece, and each cell contains the ID of the piece that occupies it (0 for empty).

```ts
type Board = number[][]; // 5x11 grid, 0 = empty, 1+ = piece ID
```

This has memory overhead due to duplication, but anything else would probably be too unwieldy to be worth using. Simple indexing, easy collision detection, and straightforward placement operations make this the clear choice.

## Piece Representations

### Rectangles with "on" and "off" cells

Each piece is a bounding rectangle with a boolean grid indicating filled cells.

```ts
type Piece = {
  id: number;
  shape: boolean[][]; // true = filled cell
};
```

Simple to do sliding window collision detection with. Easy to rotate and reflect. Natural for rendering.

### Offsets from a main cell

Alternative representation using coordinate offsets from a reference point.

```ts
type PieceAsOffsets = {
  id: number;
  offsets: [number, number][]; // [row, col] relative to origin
};
```

More memory efficient but less intuitive. The rectangle approach is probably better for this problem.

## Orientation Generation

Pieces can be rotated (4 orientations) and reflected (2 variants). We generate all 8 possible orientations and remove duplicates for symmetric pieces.

```ts
function generateOrientations(piece: Piece): Piece[] {
  // Generate 4 rotations x 2 reflections, remove duplicates
}
```

If we treat pieces like their own distinct grids, we can reuse grid rotation and reflection code from n-queens.

## Solver State

This problem is barely different from n-queens honestly. All that's notably changing is the rules for piece placement and the representation we have to use for the board.

Unlike n-queens which typically has relatively few solutions, this puzzle has a huge number of possible solutions. As such, we should use generators to yield solutions one at a time rather than collecting them all in memory.

The solver needs the current board state, remaining pieces to place, and should yield solutions as they're found.

### Core types and functions

```ts
type Board = number[][];
type Position = [row: number, col: number];

type PuzzleState = {
  board: Board;
  remainingPieces: Set<number>;
};

function placePiece(
  state: PuzzleState,
  pieceId: number,
  rotations: number,
  flipped: boolean,
  position: Position,
): PuzzleState;

function canPlacePiece(board: Board, piece: Piece, rotations: number, flipped: boolean, position: Position): boolean;

function isComplete(state: PuzzleState): boolean;

function selectNextPiece(remainingPieces: Set<number>): number; // largest piece by bounding box area

function* solve(state: PuzzleState): Generator<PuzzleState>; // yield solutions
```

### Piece Selection Heuristics

There are several strategies for choosing which piece to place next:

#### Largest piece by actual area (count of filled cells)

More accurate measure of piece size, but requires counting `true` values in the shape array each time.

#### Largest piece by bounding box (width × height)

Simple to compute, good approximation of size, but can overestimate for sparse pieces.

#### Fewest valid placements

Theoretically optimal for constraint satisfaction, but expensive to compute as it requires checking every remaining piece against every board position.

For this problem, largest by bounding box seems like a reasonable compromise between simplicity and effectiveness.

The general control flow in pseudocode:

```

solve:
if no remaining pieces, yield current state (solution found)

select next piece to place (largest by width × height)

for each orientation of the piece:
for each valid position on board:
if piece can be placed:
yield\* solve(place piece) // yield all solutions from this branch

// implicit return (no more solutions from this branch)

```

We could probably even reuse the solve function from n-queens with minimal modifications, just changing it to a generator function to handle the large solution space efficiently.

## List of Pieces

0-9

```
         _3_                  88 999
111 __22 33_ _4_ _5__ _66 _77 8_ __9
1_1 222_ _33 444 5555 666 77_ 8_ __9
```

10-12

```
        22_
0___ 1_ _22
0000 11 __2
```
