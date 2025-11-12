import React from 'react';
import { usePuzzleStore } from '../store/usePuzzleStore';

export const Palette: React.FC = () => {
  const { pieces } = usePuzzleStore();
  const { addPin } = usePuzzleStore(s => s.actions);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="font-semibold mb-2">Palette</h3>
      <div className="grid grid-cols-2 gap-2">
        {pieces.map((p) => (
          <button key={p.id}
            className="rounded-xl border px-2 py-2 text-left hover:shadow"
            onClick={() => addPin({ pieceId: p.id, origin: { q: 0, r: 0 }, rot: 0, mirror: false })}
            title={`Add pin of ${p.name}`}
          >
            <div className="text-xs font-medium">{p.name}</div>
            <div className="text-[10px] text-gray-500">{p.cells.length} hex</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-3">点击添加一个固定实例（默认在原点，随后在棋盘上移动/删除）。</p>
    </div>
  );
};
