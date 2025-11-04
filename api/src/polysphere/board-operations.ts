import { getPiece } from "./pieces.js"
import { getPieceBoundingBoxArea } from "./pieces.js";
/**
 * Select the next piece to place using largest-by-bounding-box heuristic
 * @param remainingPieces Set of piece IDs that haven't been placed yet
 * @returns The ID of the piece with the largest bounding box (width × height)
 * @throws Error if no pieces remain
 */
export function selectNextPiece(remainingPieces: Set<number>): number {
  if(remainingPieces.size === 0) {
     throw new Error("no pieces remain"); 
  } 

  const largestShapeId = Array.from(remainingPieces).reduce((largestBoundSoFarId, currentShapeId) => {
      const largestBound = getPieceBoundingBoxArea(getPiece(largestBoundSoFarId));
      const currentBound = getPieceBoundingBoxArea(getPiece(currentShapeId));
      return currentBound > largestBound ? currentShapeId : largestBoundSoFarId;
  });

  return largestShapeId;
}
