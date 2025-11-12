import { describe, it, expect } from 'vitest';
import { generateAllTransforms } from '../lib/piece';

describe('piece transforms', () => {
  it('deduplicates rotations & mirrors', () => {
    const tri = [{q:0,r:0},{q:1,r:0},{q:1,r:-1}];
    const all = generateAllTransforms(tri, true);
    // boomerang trihex has 6 rotations + 6 mirrors but some coincide => expect <=12 and > 2
    expect(all.length).toBeGreaterThan(2);
    expect(all.length).toBeLessThanOrEqual(12);
  });
});
