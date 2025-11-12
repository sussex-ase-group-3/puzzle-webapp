// Hex axial coordinate utilities (pointy-top). Strict & testable.
export type Axial = { q: number; r: number };

export const DIRS: Readonly<Axial[]> = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
] as const;

export function axialToCube(a: Axial) {
  const x = a.q;
  const z = a.r;
  const y = -x - z;
  return { x, y, z };
}
export function cubeToAxial(c: { x: number; y: number; z: number }): Axial {
  return { q: c.x, r: c.z };
}

// rotate by k*60deg around origin (k in 0..5)
export function rotA(a: Axial, k: number): Axial {
  const times = ((k % 6) + 6) % 6;
  let { x, y, z } = axialToCube(a);
  for (let i = 0; i < times; i++) {
    const nx = -z, ny = -x, nz = -y; // 60° rotation
    x = nx; y = ny; z = nz;
  }
  return cubeToAxial({ x, y, z });
}

// reflect across cube x-axis (≈ mirror on axial q-axis family)
export function refA(a: Axial): Axial {
  const { x, y, z } = axialToCube(a);
  return cubeToAxial({ x, y: z, z: y });
}

export function addA(a: Axial, b: Axial): Axial { return { q: a.q + b.q, r: a.r + b.r }; }

export function serializeCell(a: Axial): string { return `${a.q},${a.r}`; }
export function parseCell(s: string): Axial { const [q, r] = s.split(",").map(Number); return { q, r }; }

// normalize: translate so smallest (q,r) lexicographically near origin; sorted
export function normShape(cells: Axial[]): Axial[] {
  if (!cells.length) return [];
  let minQ = Infinity, minR = Infinity;
  for (const c of cells) {
    if (c.q < minQ) { minQ = c.q; minR = Math.min(minR, c.r); }
    else if (c.q === minQ) { minR = Math.min(minR, c.r); }
  }
  const shifted = cells.map(c => ({ q: c.q - minQ, r: c.r - minR }));
  shifted.sort((a, b) => (a.q - b.q) || (a.r - b.r));
  return shifted;
}

export function uniqKey(cells: Axial[]): string {
  return normShape(cells).map(serializeCell).join(';');
}

// pointy-top axial to pixel (for SVG)
export function axialToPixel(a: Axial, size: number) {
  const x = size * Math.sqrt(3) * (a.q + a.r / 2);
  const y = size * 1.5 * a.r;
  return { x, y };
}
