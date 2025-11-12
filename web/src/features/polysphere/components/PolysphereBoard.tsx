// web/src/features/polysphere/components/PolysphereBoard.tsx
import type { Board } from "../utils";
import { PIECE_COLOURS } from "../pieces";

export function PolysphereBoard({
                                    board, previewCells, onCellDown, onCellEnter, editable=false,
                                }: {
    board: Board;
    previewCells?: Set<string>; // keys "r,c"
    editable?: boolean;
    onCellDown?: (r:number,c:number,e:React.MouseEvent)=>void;
    onCellEnter?: (r:number,c:number)=>void;
}) {
    const rows = board.length, cols = board[0]?.length ?? 0;
    const size = `min(40px, calc(75vmin/${Math.max(rows, cols)}))`;
    return (
        <div
            style={{
                display:"grid",
                gridTemplateColumns:`repeat(${cols}, ${size})`,
                gridAutoRows: size,
                border:"1px solid #ccc", width:"fit-content", userSelect:"none"
            }}
            onContextMenu={e=>editable && e.preventDefault()}
        >
            {board.flatMap((row, r) => row.map((cell, c) => {
                const k = `${r},${c}`;
                const preview = previewCells?.has(k);
                const filled = cell>0;
                const bg = filled ? PIECE_COLOURS[cell] : preview ? "rgba(0,0,0,0.15)" : ((r+c)%2? "#eee":"#fff");
                return (
                    <div
                        key={k}
                        onMouseDown={e=>editable && onCellDown?.(r,c,e)}
                        onMouseEnter={()=>editable && onCellEnter?.(r,c)}
                        style={{
                            background: bg,
                            border: "1px solid rgba(0,0,0,0.06)",
                            cursor: editable ? "pointer" : "default",
                            width: "100%", height: "100%",
                        }}
                    />
                );
            }))}
        </div>
    );
}
