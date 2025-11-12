import React from 'react';
import { usePuzzleStore } from '../store/usePuzzleStore';
import { normShape, serializeCell, axialToPixel } from '../lib/hex';
import { Piece } from '../lib/piece';

export const PieceLab: React.FC = () => {
  const { pieces } = usePuzzleStore();
  const { addPiece, clearPieces } = usePuzzleStore(s => s.actions);
  const [name, setName] = React.useState('');
  const [cells, setCells] = React.useState(new Set<string>());
  const miniW = 9, miniH = 9, size = 12; const origin = { q: Math.floor(miniW/2), r: Math.floor(miniH/2) };

  function toggle(q: number, r: number) {
    const k = serializeCell({ q, r });
    const next = new Set(cells);
    if (next.has(k)) next.delete(k); else next.add(k);
    setCells(next);
  }

  function add() {
    const raw = [...cells].map(s => {
      const [q, r] = s.split(',').map(Number);
      return { q: q - origin.q, r: r - origin.r };
    });
    if (!raw.length) return;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
    const p: Piece = { id, name: name || `P${pieces.length+1}`, cells: normShape(raw) };
    addPiece(p); setName(''); setCells(new Set());
  }

  const grid: { q:number; r:number }[] = React.useMemo(() => {
    const a: { q:number; r:number }[] = [];
    for (let r=0;r<miniH;r++) for (let q=0;q<miniW;q++) a.push({q,r});
    return a;
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-3">
      <h3 className="text-lg font-semibold">Piece Lab</h3>
      <div className="flex gap-2 items-center">
        <input className="border rounded px-2 py-1" placeholder="Piece name" value={name} onChange={e=>setName(e.target.value)} />
        <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={add}>Add piece</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={clearPieces}>Clear all pieces</button>
      </div>
      <div className="flex gap-3">
        <svg width={miniW * size * Math.sqrt(3) + 40} height={miniH * size * 1.5 + 40} className="bg-gray-50 rounded-xl border">
          <g transform="translate(20,20)">
            {grid.map((c, i) => {
              const on = cells.has(serializeCell(c));
              const { x, y } = axialToPixel(c, size);
              const pts: string[] = [];
              for (let k=0;k<6;k++){ const ang=(Math.PI/180)*(60*k-30); pts.push(`${x+size*Math.cos(ang)},${y+size*Math.sin(ang)}`); }
              return (
                <g key={i} onClick={()=>toggle(c.q, c.r)} style={{ cursor:'pointer' }}>
                  <polygon points={pts.join(' ')} fill={on?'#111':'#fff'} stroke="#ccc" strokeWidth={on?3:1.5} />
                </g>
              );
            })}
          </g>
        </svg>
        <div className="text-sm text-gray-600">
          点击编辑多球体（polyhex）。中心为原点，保存时自动规范化。
        </div>
      </div>
      <div className="text-xs text-gray-700">当前拼块数：{pieces.length}</div>
    </div>
  );
};
