/**
 * Sends a POST request to the Polysphere solver API and returns the solution.
 * Throws an error if the server response is not OK.
 */
export async function fetchPolysphereSolution(
  board: number[][],
  timeout: number = 60000 // 60 seconds default timeout
): Promise<{ solution: number[][] | null; message?: string }> {
  // Create an AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch("/api/polysphere-solver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board }),
      signal: controller.signal
    });
    
    // Clear the timeout since the request completed
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Solve failed: ${response.status} ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    // Clear the timeout in case of error
    clearTimeout(timeoutId);
    
    // Re-throw the error with more context
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout. The puzzle is too complex to solve in a reasonable time.");
    }
    
    throw error;
  }
}