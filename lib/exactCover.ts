// Generic Dancing Links (DLX) / Algorithm X implementation
export type Column = { name: string };
export type Row = { id: string; cols: string[] };

class DLXNode {
  L: DLXNode; R: DLXNode; U: DLXNode; D: DLXNode; C: DLXCol | null = null; rowId: string | null = null;
  constructor() { this.L = this; this.R = this; this.U = this; this.D = this; }
}
class DLXCol extends DLXNode { size = 0; constructor(public name: string) { super(); } }

export function buildDLX(columns: Column[], rows: Row[]) {
  const header = new DLXCol('header');
  const colMap = new Map<string, DLXCol>();

  // build columns
  let prev: DLXNode = header;
  for (const c of columns) {
    const col = new DLXCol(c.name);
    colMap.set(c.name, col);
    col.L = prev; col.R = prev.R; prev.R.L = col; prev.R = col;
    col.U = col; col.D = col;
    prev = col;
  }

  // build rows
  for (const r of rows) {
    let first: DLXNode | null = null; let last: DLXNode | null = null;
    for (const cn of r.cols) {
      const col = colMap.get(cn);
      if (!col) throw new Error(`Unknown column ${cn}`);
      const node = new DLXNode();
      node.C = col; node.rowId = r.id;
      // link into column
      node.U = col.U; node.D = col; col.U.D = node; col.U = node; col.size++;
      // link horizontally (circular)
      if (!first) { first = node; last = node; node.L = node; node.R = node; }
      else { node.L = last!; node.R = first; last!.R = node; first.L = node; last = node; }
    }
  }
  return header;
}

function cover(col: DLXCol) {
  col.R.L = col.L; col.L.R = col.R;
  for (let i = col.D; i !== col; i = i.D) {
    for (let j = i.R; j !== i; j = j.R) {
      j.D.U = j.U; j.U.D = j.D; (j.C as DLXCol).size--;
    }
  }
}
function uncover(col: DLXCol) {
  for (let i = col.U; i !== col; i = i.U) {
    for (let j = i.L; j !== i; j = j.L) {
      (j.C as DLXCol).size++; j.D.U = j; j.U.D = j;
    }
  }
  col.R.L = col; col.L.R = col;
}

function chooseMinColumn(header: DLXCol): DLXCol | null {
  let best: DLXCol | null = null; let size = Infinity;
  for (let c = header.R as DLXCol; c !== header; c = c.R as DLXCol) {
    if (c.size < size) { size = c.size; best = c; }
  }
  return best;
}

export type DLXSolveOptions = { limit?: number; onSolution: (rowIds: string[]) => void };

export function solveDLX(header: DLXCol, opts: DLXSolveOptions) {
  const stack: DLXNode[] = []; let found = 0; const limit = opts.limit ?? Infinity;
  function search() {
    if ((header.R as DLXCol) === header) { opts.onSolution(stack.map(n => n.rowId!) ); found++; return found < limit; }
    const col = chooseMinColumn(header); if (!col || col.size === 0) return true; // dead end
    cover(col);
    for (let r = col.D; r !== col; r = r.D) {
      stack.push(r);
      for (let j = r.R; j !== r; j = j.R) cover(j.C as DLXCol);
      const cont = search();
      for (let j = r.L; j !== r; j = j.L) uncover(j.C as DLXCol);
      stack.pop();
      if (!cont) { uncover(col); return false; }
    }
    uncover(col);
    return true;
  }
  search();
}
