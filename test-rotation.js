import { rotateBoard } from './api/src/n-queens/board-operations.js';

// Test with a specific 4x4 board configuration
// This represents queens at positions: (0,1), (1,3), (2,0), (3,2)
const originalBoard = [1, 3, 0, 2];

console.log('Testing rotateBoard function with 4 rotations:');
console.log('Original board:', originalBoard);

let currentBoard = [...originalBoard];

for (let i = 1; i <= 4; i++) {
  currentBoard = rotateBoard(currentBoard);
  console.log(`After rotation ${i}:`, currentBoard);
}

console.log('\nExpected after 4 rotations: should match original');
console.log('Original:     ', originalBoard);
console.log('After 4 rots: ', currentBoard);
console.log('Match?        ', JSON.stringify(originalBoard) === JSON.stringify(currentBoard));

// Let's also test with a different configuration to see the rotation pattern
console.log('\n--- Testing with different board ---');
const testBoard = [0, 2, 1, 3];
console.log('Test board:', testBoard);

let testCurrent = [...testBoard];
for (let i = 1; i <= 4; i++) {
  testCurrent = rotateBoard(testCurrent);
  console.log(`Rotation ${i}:`, testCurrent);
}
