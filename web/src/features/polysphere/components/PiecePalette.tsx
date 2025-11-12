// web/src/features/polysphere/components/PiecePalette.tsx
import { ALL_PIECES } from "../utils";
import { PIECE_COLOURS } from "../pieces";

export function PiecePalette({
                                 selected, setSelected, rotate, setRotate, flip, setFlip, disabledIds,
                             }: {
    selected: number; setSelected: (id:number)=>void;
    rotate: 0|1|2|3; setRotate:(r:0|1|2|3)=>void;
    flip: boolean; setFlip:(v:boolean)=>void;
    disabledIds?: Set<number>;
}) {
    return (
        <div style={{ display:"grid", gap:8 }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {ALL_PIECES.map(pid => {
                    const disabled = disabledIds?.has(pid);
                    return (
                        <button
                            key={pid}
                            onClick={()=>!disabled && setSelected(pid)}
                            disabled={!!disabled}
                            title={disabled ? "Already placed" : `Piece ${pid}`}
                            style={{
                                width:36, height:36, borderRadius:8,
                                border: selected===pid ? "2px solid #333" : "1px solid #ccc",
                                background: disabled ? "#ddd" : PIECE_COLOURS[pid],
                                color: "#000", cursor: disabled ? "not-allowed" : "pointer",
                            }}
                        >{pid}</button>
                    );
                })}
            </div>
            <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setRotate(((rotate+1)%4) as 0|1|2|3)}>Rotate ⟳</button>
                <label><input type="checkbox" checked={flip} onChange={e=>setFlip(e.target.checked)}/> Flip</label>
            </div>
        </div>
    );
}
