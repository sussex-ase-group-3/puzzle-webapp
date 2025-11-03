import { getPiece } from "./pieces.js"
import { getPieceBoundingBoxArea } from "./pieces.js";
/**
 * Select the next piece to place using largest-by-bounding-box heuristic
 * @param remainingPieces Set of piece IDs that haven't been placed yet
 * @returns The ID of the piece with the largest bounding box (width × height)
 * @throws Error if no pieces remain
 */
export function selectNextPiece(remainingPieces: Set<number>): number {
  //throw error if no remaining pieces:
  let id = 0;
  let boundingSize = 0

  if(remainingPieces.size === 0) {
    throw new Error("no pieces remain") 
  } 

  for (const num of remainingPieces) {
      let piece = getPiece(num);
      let boundingSizePlaceHolder = getPieceBoundingBoxArea(piece);
      if(boundingSizePlaceHolder > boundingSize) {
        id = num;
        boundingSize = boundingSizePlaceHolder;
      }
  }
  return id;  
}
