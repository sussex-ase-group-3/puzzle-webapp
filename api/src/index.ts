import express from "express";
import { solve, resetVisitedSet } from "./n-queens/solver.js";
import { BoardState } from "./n-queens/types.js";
import {
  solve as polysphere_solve,
  createEmptyBoard,
} from "./polysphere-dancing-links/dancing_links_solver.js";
import { solveDancingLinks } from "./polysphere-dancing-links/dancing_links_solver.js";
import { readFileSync } from "fs";
import { join } from "path";
import { PuzzleState } from "./polysphere/types.js";
import { range } from "./utils.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Store single active generator
let activeGenerator: {
  generator: Generator<PuzzleState>;
  maxSolutions: number | undefined;
  foundSolutions: number;
} | null = null;

// Store 3D active generator
let active3DGenerator: {
  generator: Generator<any>;
  maxSolutions: number | undefined;
  foundSolutions: number;
  placements?: any[];
} | null = null;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ ok: true, service: "api" });
});

// N-Queens solver route
app.post("/n-queens/solver", (req, res) => {
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

// Create polysphere solver
app.post("/polysphere/solver", (req, res) => {
  try {
    const { board, remainingPieces, maxSolutions } = req.body;

    let initialState: PuzzleState;

    if (!board && !remainingPieces) {
      // No input provided - assume empty board with all pieces available
      initialState = {
        board: createEmptyBoard(),
        remainingPieces: new Set(range(1, 13)), // All 12 pieces
      };
    } else {
      // Use provided PuzzleState
      initialState = {
        board: board,
        remainingPieces: new Set(remainingPieces),
      };
    }

    // Create generator and store it (replaces any existing one)
    const generator = polysphere_solve(initialState);
    activeGenerator = {
      generator,
      maxSolutions,
      foundSolutions: 0,
    };

    res.json({
      success: true,
      maxSolutions: maxSolutions ?? -1, // -1 indicates unlimited
    });
  } catch (error) {
    console.error("Polysphere solver error:", error);
    res.status(500).json({
      error: "Internal server error while creating Polysphere solver",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get next solutions from polysphere solver
app.get("/polysphere/solver/next", (req, res) => {
  try {
    const { count = 1 } = req.query;
    const requestedCount = parseInt(count as string) || 1;

    if (!activeGenerator) {
      return res.status(404).json({
        error: "No active solver. Start one with POST /polysphere/solver",
      });
    }

    const solutions: PuzzleState[] = [];
    let isComplete = false;

    for (let i = 0; i < requestedCount; i++) {
      const result = activeGenerator.generator.next();
      if (result.done) {
        isComplete = true;
        break;
      }
      solutions.push(result.value);
      activeGenerator.foundSolutions++;
    }

    // Capture values before cleanup
    const currentFoundSolutions = activeGenerator.foundSolutions;
    const currentMaxSolutions = activeGenerator.maxSolutions;

    // Clean up if complete (no maxSolutions limit for "next" endpoint)
    if (isComplete) {
      activeGenerator = null;
    }

    res.json({
      solutions,
      isComplete,
      foundSolutions: currentFoundSolutions,
      maxSolutions: currentMaxSolutions ?? -1, // -1 indicates unlimited
    });
  } catch (error) {
    console.error("Polysphere next solutions error:", error);
    res.status(500).json({
      error: "Internal server error while getting next solutions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Stream solutions at regular intervals using Server-Sent Events
app.get("/polysphere/solver/stream", (req, res) => {
  const { interval = 500 } = req.query;
  const intervalMs = parseInt(interval as string) || 500;

  if (!activeGenerator) {
    return res.status(404).json({
      error: "No active solver. Start one with POST /polysphere/solver",
    });
  }

  // Set up SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  let streamInterval: NodeJS.Timeout;

  const sendSolutionBatch = () => {
    const ag = activeGenerator;
    if (!ag) {
      res.write("event: complete\n");
      res.write('data: {"message": "Solver completed or cancelled"}\n\n');
      clearInterval(streamInterval);
      res.end();
      return;
    }

    try {
      const batchSize = 25; // Grab 25 solutions per interval
      const solutions: any[] = [];
      let isComplete = false;

      for (let i = 0; i < batchSize; i++) {
        const result = ag.generator.next();

        if (result.done) {
          isComplete = true;
          break;
        }

        ag.foundSolutions++;
        solutions.push(result.value);

        // Check if we've reached max solutions
        if (
          ag.maxSolutions !== undefined &&
          ag.foundSolutions >= ag.maxSolutions
        ) {
          isComplete = true;
          break;
        }
      }

      // Send batch of solutions
      if (solutions.length > 0) {
        const data = {
          solutions,
          foundSolutions: ag.foundSolutions,
          maxSolutions: ag.maxSolutions ?? -1, // -1 indicates unlimited
        };

        res.write("event: batch\n");
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }

      // Handle completion
      if (isComplete) {
        // Capture final counts from ag BEFORE clearing the active generator
        const finalFound = ag.foundSolutions;
        const finalMax = ag.maxSolutions;
        // Now clear the generator
        activeGenerator = null;
        res.write("event: complete\n");
        const message =
          finalMax !== undefined
            ? "Maximum solutions reached"
            : "All solutions found";
        res.write(
          `data: {"message": "${message}", "foundSolutions": ${finalFound}, "maxSolutions": ${finalMax ?? -1}}\n\n`,
        );
        clearInterval(streamInterval);
        res.end();
      }
    } catch (error) {
      res.write("event: error\n");
      res.write(
        `data: ${JSON.stringify({ error: "Error generating solution" })}\n\n`,
      );
      clearInterval(streamInterval);
      res.end();
    }
  };

  // Start streaming
  streamInterval = setInterval(sendSolutionBatch, intervalMs);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(streamInterval);
  });
});

// Cancel polysphere solver
app.delete("/polysphere/solver", (req, res) => {
  const wasActive = activeGenerator !== null;
  activeGenerator = null;

  res.json({
    success: wasActive,
    message: wasActive ? "Solver cancelled" : "No active solver",
  });
});

// Create polysphere 3D solver
app.post("/polysphere-3d/solver", (req, res) => {
  try {
    const { board, remainingPieces, maxSolutions } = req.body;

    // Load 3D matrix
    let matrixData;
    try {
      const matrixPath = join(
        process.cwd(),
        "src/polysphere-dancing-links-3d/polysphere_exact_cover_matrix.json",
      );
      const fileContent = readFileSync(matrixPath, "utf8");
      matrixData = JSON.parse(fileContent);
    } catch (error) {
      return res.status(500).json({
        error: "3D matrix file not found. Generate it first.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    const { matrix, placements } = matrixData;

    // Create generator and store it (replaces any existing one)
    const generator = solveDancingLinks(matrix, placements);
    active3DGenerator = {
      generator,
      maxSolutions,
      foundSolutions: 0,
      placements, // Store placements for solution conversion
    };

    res.json({
      success: true,
      maxSolutions: maxSolutions ?? -1, // -1 indicates unlimited
    });
  } catch (error) {
    console.error("Polysphere 3D solver error:", error);
    res.status(500).json({
      error: "Internal server error while creating Polysphere 3D solver",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get next solutions from polysphere 3D solver
app.get("/polysphere-3d/solver/next", (req, res) => {
  try {
    const { count = 1 } = req.query;
    const requestedCount = parseInt(count as string) || 1;

    if (!active3DGenerator) {
      return res.status(404).json({
        error: "No active 3D solver. Start one with POST /polysphere-3d/solver",
      });
    }

    const solutions: any[] = [];
    let isComplete = false;

    for (let i = 0; i < requestedCount; i++) {
      const result = active3DGenerator.generator.next();
      if (result.done) {
        isComplete = true;
        break;
      }
      // Include placements data with each solution
      solutions.push({
        rowIndices: result.value,
        placements: active3DGenerator.placements,
      });
      active3DGenerator.foundSolutions++;
    }

    // Capture values before cleanup
    const currentFoundSolutions = active3DGenerator.foundSolutions;
    const currentMaxSolutions = active3DGenerator.maxSolutions;

    // Clean up if complete
    if (isComplete) {
      active3DGenerator = null;
    }

    res.json({
      solutions,
      isComplete,
      foundSolutions: currentFoundSolutions,
      maxSolutions: currentMaxSolutions ?? -1, // -1 indicates unlimited
    });
  } catch (error) {
    console.error("Polysphere 3D next solutions error:", error);
    res.status(500).json({
      error: "Internal server error while getting next 3D solutions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Stream 3D solutions at regular intervals using Server-Sent Events
app.get("/polysphere-3d/solver/stream", (req, res) => {
  const { interval = 500 } = req.query;
  const intervalMs = parseInt(interval as string) || 500;

  if (!active3DGenerator) {
    return res.status(404).json({
      error: "No active 3D solver. Start one with POST /polysphere-3d/solver",
    });
  }

  // Set up SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  let streamInterval: NodeJS.Timeout;

  const sendSolutionBatch = () => {
    const ag = active3DGenerator;
    if (!ag) {
      res.write("event: complete\n");
      res.write('data: {"message": "3D Solver completed or cancelled"}\n\n');
      clearInterval(streamInterval);
      res.end();
      return;
    }

    try {
      const batchSize = 25; // Grab 25 solutions per interval
      const solutions: any[] = [];
      let isComplete = false;

      for (let i = 0; i < batchSize; i++) {
        const result = ag.generator.next();

        if (result.done) {
          isComplete = true;
          break;
        }

        ag.foundSolutions++;
        solutions.push({
          rowIndices: result.value,
          placements: ag.placements,
        });

        // Check if we've reached max solutions
        if (
          ag.maxSolutions !== undefined &&
          ag.foundSolutions >= ag.maxSolutions
        ) {
          isComplete = true;
          break;
        }
      }

      // Send batch of solutions
      if (solutions.length > 0) {
        const data = {
          solutions,
          foundSolutions: ag.foundSolutions,
          maxSolutions: ag.maxSolutions ?? -1, // -1 indicates unlimited
        };

        res.write("event: batch\n");
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }

      // Handle completion
      if (isComplete) {
        // Capture final counts from ag BEFORE clearing the active generator
        const finalFound = ag.foundSolutions;
        const finalMax = ag.maxSolutions;
        // Now clear the generator
        active3DGenerator = null;
        res.write("event: complete\n");
        const message =
          finalMax !== undefined
            ? "Maximum solutions reached"
            : "All solutions found";
        res.write(
          `data: {"message": "${message}", "foundSolutions": ${finalFound}, "maxSolutions": ${finalMax ?? -1}}\n\n`,
        );
        clearInterval(streamInterval);
        res.end();
      }
    } catch (error) {
      res.write("event: error\n");
      res.write(
        `data: ${JSON.stringify({ error: "Error generating 3D solution" })}\n\n`,
      );
      clearInterval(streamInterval);
      res.end();
    }
  };

  // Start streaming
  streamInterval = setInterval(sendSolutionBatch, intervalMs);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(streamInterval);
  });
});

// Cancel polysphere 3D solver
app.delete("/polysphere-3d/solver", (req, res) => {
  const wasActive = active3DGenerator !== null;
  active3DGenerator = null;

  res.json({
    success: wasActive,
    message: wasActive ? "3D Solver cancelled" : "No active 3D solver",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
