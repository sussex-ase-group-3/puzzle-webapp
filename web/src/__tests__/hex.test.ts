import { describe, it, expect } from 'vitest';
import { rotA, refA, uniqKey } from '../lib/hex';

describe('hex rotations & reflection', () => {
  it('rotation 6 times returns original', () => {
    const p = { q: 2, r: -1 };
    let cur = p; for (let i=0;i<6;i++) cur = rotA(cur, 1);
    expect(cur).toEqual(p);
  });
  it('uniqKey is invariant under transforms', () => {
    const tri = [{q:0,r:0},{q:1,r:0},{q:1,r:-1}];
    const a = uniqKey(tri);
    const b = uniqKey(tri.map(c=>rotA(c,2)));
    const c = uniqKey(tri.map(refA));
    expect(a).toBe(b);
    expect(a).toBe(c);
  });
});
