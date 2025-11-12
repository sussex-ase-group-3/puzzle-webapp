// web/src/features/polysphere/utils.ts
export type Board = number[][];
export const ROWS = 5, COLS = 11;
export const ALL_PIECES = Array.from({length:12}, (_,i)=>i+1);

export function emptyBoard(): Board {
    return Array.from({length: ROWS}, ()=>Array.from({length: COLS}, ()=>0));
}

// rotations/flips applied to offsets
export function rotateOffsets(offsets: number[][], turns: 0|1|2|3): number[][] {
    let pts = offsets.map(([r,c])=>[r,c]);
    for (let t=0;t<turns;t++) {
        pts = pts.map(([r,c])=>[c, -r]);
        const minR = Math.min(...pts.map(p=>p[0])), minC = Math.min(...pts.map(p=>p[1]));
        pts = pts.map(([r,c])=>[r-minR, c-minC]);
    }
    return pts as number[][];
}
export function flipHOffsets(offsets: number[][]): number[][] {
    let pts = offsets.map(([r,c])=>[r, -c]);
    const minR = Math.min(...pts.map(p=>p[0])), minC = Math.min(...pts.map(p=>p[1]));
    return pts.map(([r,c])=>[r-minR, c-minC]);
}

export function canPlace(board: Board, offsets: number[][], r0: number, c0: number) {
    for (const [dr,dc] of offsets) {
        const r=r0+dr, c=c0+dc;
        if (r<0||r>=ROWS||c<0||c>=COLS) return false;
        if (board[r][c] !== 0) return false;
    }
    return true;
}
export function place(board: Board, offsets: number[][], r0: number, c0: number, pid: number): Board {
    const next = board.map(row=>row.slice());
    for (const [dr,dc] of offsets) next[r0+dr][c0+dc] = pid;
    return next;
}
export function erasePiece(board: Board, r: number, c: number): Board {
    const pid = board[r][c];
    if (pid<=0) return board;
    const next = board.map(row=>row.slice());
    const q: [number,number][] = [[r,c]];
    next[r][c]=0;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    while (q.length) {
        const [rr,cc] = q.pop()!;
        for (const [dr,dc] of dirs) {
            const nr=rr+dr, nc=cc+dc;
            if (next[nr]?.[nc] === pid) { next[nr][nc]=0; q.push([nr,nc]); }
        }
    }
    return next;
}

export function piecesPresent(board: Board): Set<number> {
    const s = new Set<number>();
    for (const row of board) for (const v of row) if (v>0) s.add(v);
    return s;
}
export function remainingFromAllowed(allowed: number[], board: Board): number[] {
    const present = piecesPresent(board);
    return allowed.filter(id => !present.has(id));
}
