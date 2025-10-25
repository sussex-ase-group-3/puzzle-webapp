# Data Model

This document details a data model for representing and solving the Polysphere packing puzzle on a 5×11 board.
The fact that these are polyspheres doesn't actually change anything - treat them like squares.

## Board Representation

### 2D Array

A 2D array is the simplest representation. We could use different numerical IDs for each piece, and each cell could simply say what piece resides within it.
There's a lot of duplication involved in this solution, but anything else would probably be too unwieldy to be worth using.

## Piece Representations

### Rectangles with "on" and "off" cells

Simple to do sliding window things with. That's about it really.

### Offsets from a main cell

Pieces could be represented as 2D offsets from a "main" square. This feels clunky though.

- which would be the "main" square? why?
- what benefit does this give over the previous one? i can't think of any.

## Orientation Generation

Pieces can be rotated or reflected. If we treat pieces like their own distinct grids, we can reuse the grid rotation and grid reflection code from n-queens.

## Solver

This problem is barely different to n-queens honestly. All that's notably changing is the rules for piece placement and the representation we have to use for the board. We could probably even reuse the solve function unaltered.
