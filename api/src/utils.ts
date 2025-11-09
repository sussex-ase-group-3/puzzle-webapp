/**
 * Global utility functions for the puzzle webapp
 */

/**
 * Generate a range of numbers
 * - range(end): numbers from 0 to end-1
 * - range(start, end): numbers from start to end-1
 * @param startOrEnd Starting number (if end provided) or ending number (if only one arg)
 * @param end Ending number (exclusive), optional
 * @returns Array of numbers
 */
export function range(startOrEnd: number, end?: number): number[] {
  if (end === undefined) {
    // range(end) -> range(0, end)
    return Array.from({ length: startOrEnd }, (_, i) => i);
  }
  // range(start, end)
  return Array.from({ length: end - startOrEnd }, (_, i) => startOrEnd + i);
}
