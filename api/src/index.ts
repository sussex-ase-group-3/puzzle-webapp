import express from "express";
import { solve, resetVisitedSet } from "./n-queens/solver.js";
import { BoardState } from "./n-queens/types.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ ok: true, service: "api" });
});

// N-Queens solver route
app.post("/solver", (req, res) => {
  try {
    console.log("Received request:", req.body);
    const { n, board } = req.body;

    // Validate n parameter
    if (!n || typeof n !== "number" || n < 1) {
      console.log("Invalid n parameter:", n);
      return res.status(400).json({
        error: "Parameter 'n' is required and must be a positive integer",
      });
    }

    // Create initial board state
    let initialBoard: BoardState;

    if (board && Array.isArray(board)) {
      // Validate provided board
      if (board.length !== n) {
        return res.status(400).json({
          error: `Board array length (${board.length}) must match n (${n})`,
        });
      }

      // Validate board values
      for (let i = 0; i < board.length; i++) {
        if (
          board[i] !== -1 &&
          (typeof board[i] !== "number" || board[i] < 0 || board[i] >= n)
        ) {
          return res.status(400).json({
            error: `Invalid board value at index ${i}. Values must be -1 (empty) or valid column indices (0 to ${n - 1})`,
          });
        }
      }

      initialBoard = board;
    } else {
      // Create empty board of size n
      initialBoard = new Array(n).fill(-1);
    }

    // Reset visited set before solving to clear any previous state
    resetVisitedSet();

    // Solve the puzzle
    console.log("Solving with initial board:", initialBoard);
    const solutions = solve(initialBoard);
    console.log("Raw solutions:", solutions);
    console.log("Solutions size:", solutions.size);

    // Convert solutions to array of board states
    const boardStates = Array.from(solutions).map((solutionStr) => {
      console.log("Processing solution string:", solutionStr);
      return JSON.parse(`[${solutionStr}]`);
    });

    console.log("Final board states:", boardStates);
    res.json({
      solutions: boardStates,
    });
  } catch (error) {
    console.error("Solver error:", error);
    res.status(500).json({
      error: "Internal server error while solving N-Queens puzzle",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
