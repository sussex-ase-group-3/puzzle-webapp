import { Axial, normShape, refA, rotA, serializeCell } from './hex';

export type Piece = {
  id: string;
  name: string;
  cells: Axial[];      // canonical (normalized)
  mirrorable?: boolean;
};

export type Pin = { pieceId: string; origin: Axial; rot: number; mirror: boolean };

export function transformShape(shape: Axial[], rot: number, mirror: boolean): Axial[] {
  let out = shape.map(c => ({ ...c }));
  if (mirror) out = out.map(refA);
  out = out.map(c => rotA(c, rot));
  return normShape(out);
}

export function offsetShape(shape: Axial[], origin: Axial): Axial[] {
  return shape.map(c => ({ q: c.q + origin.q, r: c.r + origin.r }));
}

export function generateAllTransforms(shape: Axial[], allowMirror: boolean) {
  const seen = new Set<string>();
  const outs: { shape: Axial[]; rot: number; mirror: boolean }[] = [];
  for (let rot = 0; rot < 6; rot++) {
    const t = transformShape(shape, rot, false);
    const key = t.map(serializeCell).join(';');
    if (!seen.has(key)) { seen.add(key); outs.push({ shape: t, rot, mirror: false }); }
  }
  if (allowMirror) {
    for (let rot = 0; rot < 6; rot++) {
      const t = transformShape(shape, rot, true);
      const key = t.map(serializeCell).join(';');
      if (!seen.has(key)) { seen.add(key); outs.push({ shape: t, rot, mirror: true }); }
    }
  }
  return outs;
}

export function shapeFitsOnBoard(cells: Axial[], boardSet: Set<string>): boolean {
  return cells.every(c => boardSet.has(serializeCell(c)));
}

export function collides(cells: Axial[], forbidden: Set<string>): boolean {
  return cells.some(c => forbidden.has(serializeCell(c)));
}
