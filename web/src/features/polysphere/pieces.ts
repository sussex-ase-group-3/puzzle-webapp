// web/src/features/polysphere/pieces.ts
/*note this is duplication of api/src/polysphere/pieces.ts and could be eliminated via API design*/
export type BoolGrid = boolean[][];
export const PIECE_SHAPES: BoolGrid[] = [
    [], // 0 placeholder
    [[true,true,true],[true,false,true]],
    [[false,false,true,true],[true,true,true,false]],
    [[false,true,false],[true,true,false],[false,true,true]],
    [[false,true,false],[true,true,true]],
    [[false,true,false,false],[true,true,true,true]],
    [[false,true,true],[true,true,true]],
    [[false,true,true],[true,true,false]],
    [[true,true],[true,false],[true,false]],
    [[true,true,true],[false,false,true],[false,false,true]],
    [[true,false,false,false],[true,true,true,true]],
    [[true,false],[true,true]],
    [[true,true,false],[false,true,true],[false,false,true]],
];

export const PIECE_COLOURS = [
    "", "#e51e0f","#f669a8","#f8b7d7","#1c8ed2","#faed5b",
    "#b165a8","#713d96","#63ad68","#ea6a22","#129338","#fed04e","#8bcaf1",
];

// turn a BoolGrid into [dr,dc] offsets anchored at (0,0)
export function toOffsets(shape: BoolGrid): number[][] {
    const pts: number[][] = [];
    for (let r=0;r<shape.length;r++)
        for (let c=0;c<shape[0].length;c++)
            if (shape[r][c]) pts.push([r,c]);
    // normalize so min r/c are 0
    const minR = Math.min(...pts.map(p=>p[0])), minC = Math.min(...pts.map(p=>p[1]));
    return pts.map(([r,c])=>[r-minR, c-minC]);
}
