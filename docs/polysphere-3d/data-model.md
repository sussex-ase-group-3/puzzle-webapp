# Data Model

This document details a data model for representing and solving the 3D Pyramid Polysphere packing puzzle.
Same 12 polysphere pieces as the flat version, but now they go into a 3D pyramid structure instead of a 5x11 board.

## Pyramid Structure

### Layered 3D Representation

The pyramid has 5 layers that get smaller as you go up:

- Layer 0 (bottom): 5×5 = 25 cells
- Layer 1: 4×4 = 16 cells
- Layer 2: 3×3 = 9 cells
- Layer 3: 2×2 = 4 cells
- Layer 4 (top): 1×1 = 1 cell

Total: 55 cells (same as the flat 5×11 board)

### Linear Cell Indexing

We map 3D coordinates to a linear index for the exact cover matrix:

```js
// Layer 0: indices 0-24
// Layer 1: indices 25-40
// Layer 2: indices 41-49
// Layer 3: indices 50-53
// Layer 4: index 54

function pyramidToIndex(layer: number, row: number, col: number): number {
  return PYRAMID_LAYERS[layer].startIndex + row * PYRAMID_LAYERS[layer].size + col;
}
```

This lets us treat the 3D structure as a 1D array for the solver while keeping the spatial relationships clear.

## Piece Orientations - The Plane-Based Approach

This is where it gets interesting. Instead of just rotating pieces on a flat board, we can place them in three different "plane systems":

### XY Orientations (Flat Placements)

Pieces lie flat on individual pyramid layers, just like the 2D version but constrained by each layer's size.

```
shape[r][c] -> pyramid[layer][row+r][col+c]
```

### XZ Orientations (Vertical Spanning - Type 1)

Pieces "stand up" with rows becoming layers and columns becoming X coordinates.

```
shape[r][c] -> pyramid[startLayer+r][yPos][xPos+c]
```

### YZ Orientations (Vertical Spanning - Type 2)

Pieces "stand up" differently with columns becoming layers and rows becoming X coordinates.

```
shape[r][c] -> pyramid[startLayer+c][xPos+r][yPos]
```

The key insight is treating each orientation type as placement on different 2D "slices" through the 3D space. This gives comprehensive coverage while keeping the logic manageable.

## Exact Cover Matrix Representation

Same approach as the flat version but adapted for 3D:

```
[C1, C2, ..., C55, P1, P2, ..., P12]
```

- `CX` represents pyramid cell `X` (0-54)
- `PX` represents piece `X` (1-12)

Each matrix row represents one possible piece placement (piece + position + orientation type).

## Orientation Generation & Distinctness

We generate the same 2D orientations as before (rotations + reflections), but then map each one into all three plane systems:

```
for each piece:
  for each 2D orientation:
    try XY placements on each layer
    try XZ placements spanning layers
    try YZ placements spanning layers
```

## Implementation Notes

The Dancing Links solver is identical to the 2D version - all the 3D complexity is handled in the matrix generation phase. Once you have the exact cover matrix, it's just a standard constraint satisfaction problem.
