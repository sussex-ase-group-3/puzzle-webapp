import { readFileSync } from "fs";
import { join } from "path";
import { solveDancingLinks } from "../polysphere-dancing-links/dancing_links_solver.js";

export type PyramidBoard = number[][][]; // [layer][row][col]

export type Poly3DPuzzleState = {