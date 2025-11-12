import React from 'react';
import { axialToPixel, serializeCell } from '../lib/hex';
import { usePuzzleStore } from '../store/usePuzzleStore';
import { transformShape, offsetShape } from '../lib/piece';

type Axial = { q: number; r: number };

const HexCell: React.FC<{
  x: number; y: number; size: number; fill: string;
  stroke?: string; onClick?: () => void; label?: string; selected?: boolean;
}> = ({ x, y, size, fill, stroke = '#bbb', onClick, label, selected }) => {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${x + size * Math.cos(ang)},${y + size * Math.sin(ang)}`);
  }
  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 1.5}/>
      {label && <text x={x} y={y + 4} fontSize={size * 0.5} textAnchor="middle" fill="#111">{label}</text>}
    </g>
  );
};

export const BoardCanvas: React.FC = () => {
  const { width, height, hexSize, blocked, pieces, pins, allowMirror, solutions } = usePuzzleStore();
  const { toggleBlocked } = usePuzzleStore(s => s.actions);

  const cells: Axial[] = React.useMemo(() => {
    const arr: Axial[] = []; for (let r = 0; r < height; r++) for (let q = 0; q < width; q++) arr.push({ q, r });
    return arr;
  }, [width, height]);

  // 显示第一个解作为覆盖；没有解时显示 pins
  const displayPins = React.useMemo(() => (solutions.length ? solutions[0] : pins), [solutions, pins]);

  const occ = React.useMemo(() => {
    const m = new Map<string, { color: string; label: string }>();
    const palette = ['#fca5a5','#fdba74','#fcd34d','#bbf7d0','#86efac','#67e8f9','#93c5fd','#a5b4fc','#c4b5fd','#fbcfe8','#e9d5ff','#fecdd3'];
    for (let i = 0; i < displayPins.length; i++) {
      const pin = displayPins[i];
      const p = pieces.find(pp => pp.id === pin.pieceId); if (!p) continue;
      const t = transformShape(p.cells, pin.rot, pin.mirror && allowMirror);
      const placed = offsetShape(t, pin.origin);
      for (const c of placed) m.set(serializeCell(c), { color: palette[i % palette.length], label: p.name.slice(0,2) });
    }
    return m;
  }, [displayPins, pieces, allowMirror]);

  const widthPx = Math.ceil(Math.sqrt(3) * hexSize * (Math.max(...cells.map(c => c.q + c.r / 2)) + 1)) + 40;
  const heightPx = Math.ceil(1.5 * hexSize * (Math.max(...cells.map(c => c.r)) + 1)) + 40;

  return (
    <svg width={widthPx} height={heightPx} className="bg-gray-50 rounded-xl border">
      <g transform={`translate(20,20)`}>
        {cells.map((c, idx) => {
          const { x, y } = axialToPixel(c, hexSize);
          const k = serializeCell(c);
          const blockedOn = blocked.has(k);
          const overlay = occ.get(k);
          return (
            <HexCell key={idx}
              x={x} y={y} size={hexSize}
              fill={blockedOn ? '#111' : overlay ? overlay.color : '#fff'}
              selected={!!overlay}
              label={overlay?.label}
              onClick={() => toggleBlocked(c.q, c.r)}
            />
          );
        })}
      </g>
    </svg>
  );
};
