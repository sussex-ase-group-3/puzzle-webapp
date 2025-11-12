import React from 'react';
import { usePuzzleStore } from '../store/usePuzzleStore';

export const SolvePanel: React.FC = () => {
  const { solutions, solving } = usePuzzleStore();
  const { solve, resetSolutions, clearPins } = usePuzzleStore(s => s.actions);
  const [limit, setLimit] = React.useState<number | undefined>(undefined);

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-2">
      <h3 className="font-semibold">Solver</h3>
      <div className="flex gap-2 items-center">
        <label className="text-sm">Limit</label>
        <input type="number" className="border rounded px-2 py-1 w-24"
               value={limit ?? ''} onChange={e=>setLimit(e.target.value? +e.target.value : undefined)} />
        <button className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-60"
                disabled={solving} onClick={()=>solve(limit)}>Solve</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={resetSolutions}>Clear solutions</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={clearPins}>Clear pins</button>
        <span className="text-sm text-gray-600">{solving? 'Solving…' : `${solutions.length} solution(s)`}</span>
      </div>
    </div>
  );
};
