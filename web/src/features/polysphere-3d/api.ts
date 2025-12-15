// API client for 3D polysphere solver

import type {
  Poly3DPuzzleState,
  Poly3DStartRequest,
  Poly3DNextResponse,
} from "./types";

const API_BASE_URL = "http://localhost:3000";

export async function startPolysphere3DSolver(
  request: Poly3DStartRequest = {},
): Promise<{ success: boolean; maxSolutions: number }> {
  const response = await fetch(`${API_BASE_URL}/polysphere-3d/solver`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to start 3D solver");
  }

  return response.json();
}

export async function getNext3DSolutions(
  count: number = 1,
): Promise<Poly3DNextResponse> {
  const response = await fetch(
    `${API_BASE_URL}/polysphere-3d/solver/next?count=${count}`,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get next 3D solutions");
  }

  return response.json();
}

export async function cancelPolysphere3DSolver(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch(`${API_BASE_URL}/polysphere-3d/solver`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cancel 3D solver");
  }

  return response.json();
}

export function stream3DSolutions(
  onBatch: (
    solutions: any[],
    foundSolutions: number,
    maxSolutions: number,
  ) => void,
  onComplete: (
    message: string,
    foundSolutions: number,
    maxSolutions: number,
  ) => void,
  onError: (error: string) => void,
  interval: number = 500,
): () => void {
  const eventSource = new EventSource(
    `${API_BASE_URL}/polysphere-3d/solver/stream?interval=${interval}`,
  );

  eventSource.addEventListener("batch", (event) => {
    try {
      const data = JSON.parse(event.data);
      onBatch(data.solutions, data.foundSolutions, data.maxSolutions);
    } catch (error) {
      onError("Failed to parse batch data");
    }
  });

  eventSource.addEventListener("complete", (event) => {
    try {
      const data = JSON.parse(event.data);
      onComplete(
        data.message,
        data.foundSolutions || 0,
        data.maxSolutions || -1,
      );
    } catch (error) {
      onError("Failed to parse completion data");
    }
    eventSource.close();
  });

  eventSource.addEventListener("error", (event) => {
    try {
      const data = JSON.parse((event as any).data);
      onError(data.error || "Stream error");
    } catch (error) {
      onError("Unknown stream error");
    }
    eventSource.close();
  });

  eventSource.onerror = () => {
    onError("Connection error");
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}
