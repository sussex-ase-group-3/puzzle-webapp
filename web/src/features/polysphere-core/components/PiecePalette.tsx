// web/src/features/polysphere-core/components/PiecePalette.tsx
import { PIECE_SHAPES, PIECE_COLOURS, toOffsets } from "../pieces";
import { ALL_PIECES } from "../pieceTypes";


const DND_MIME = "application/x-polysphere-piece";

export function PiecePalette({
                                 selected, setSelected, turns, setTurns, flip, setFlip, disabledIds,
                             }: {
    selected: number; setSelected: (id:number)=>void;
    turns: 0|1|2|3; setTurns: (t:0|1|2|3)=>void;
    flip: boolean; setFlip: (v:boolean)=>void;
    disabledIds?: Set<number>;
}) {
    return (
        <div style={{ display:"grid", gap:8 }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {ALL_PIECES.map(pid => {
                    const disabled = !!disabledIds?.has(pid);
                    return (
                        <div key={pid} style={{ display:"grid", gap:4, justifyItems:"center" }}>
                            <button
                                onClick={()=>!disabled && setSelected(pid)}
                                disabled={disabled}
                                style={{
                                    width:36, height:36, borderRadius:8,
                                    border: selected===pid ? "2px solid #333" : "1px solid #ccc",
                                    background: disabled ? "#ddd" : "#fff",
                                    cursor: disabled ? "not-allowed" : "pointer",
                                }}
                                title={disabled ? "Already placed" : `Piece ${pid}`}
                            >{pid}</button>

                            {/* Draggable mini */}
                            <div
                                draggable={!disabled}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData(DND_MIME, JSON.stringify({ pieceId: pid, turns, flip }));
                                    e.dataTransfer.effectAllowed = "copy";
                                }}
                                style={{ opacity: disabled ? 0.5 : 1, border: "1px dashed #ccc", padding: 4 }}
                                title="Drag to board"
                            >
                                <MiniShape pieceId={pid} colour={PIECE_COLOURS[pid]} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <button onClick={()=>setTurns(((turns+1)%4) as 0|1|2|3)}>Rotate ⟳</button>
                <label><input type="checkbox" checked={flip} onChange={e=>setFlip(e.target.checked)} /> Flip</label>
            </div>
        </div>
    );
}

function MiniShape({ pieceId, colour }: { pieceId: number; colour: string }) {
    const shape = PIECE_SHAPES[pieceId];
    const r = shape.length, c = shape[0].length;
    const size = 10;
    return (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${c}, ${size}px)`, gridAutoRows:`${size}px` }}>
            {shape.flatMap((row, i) =>
                row.map((cell, j) => (
                    <div key={`${i}-${j}`} style={{ width:size, height:size, display:"grid", placeItems:"center" }}>
                        {cell && <div style={{ width:8, height:8, borderRadius:"50%", background: colour }} />}
                    </div>
                ))
            )}
        </div>
    );
}

// re-export so the page can reuse the MIME type
export { DND_MIME };
