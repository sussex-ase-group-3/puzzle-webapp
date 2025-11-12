/// <reference lib="webworker" />
import { makeParallelogramBoard } from '../lib/board';
import { solveAll } from '../lib/solver';

export type StartMsg = {
  type: 'start';
  payload: { width: number; height: number; pieces: any[]; pins: any[]; blocked: string[]; allowMirror: boolean; limit?: number };
};
export type CancelMsg = { type: 'cancel' };
export type WorkerMsg = StartMsg | CancelMsg;

let cancelled = false;

self.onmessage = (e: MessageEvent<WorkerMsg>) => {
  const msg = e.data;
  if (msg.type === 'cancel') { cancelled = true; return; }
  if (msg.type === 'start') {
    cancelled = false;
    const { width, height, pieces, pins, blocked, allowMirror, limit } = msg.payload;
    const board = makeParallelogramBoard(width, height);
    const res = solveAll({ board, pieces, pins, blocked: new Set(blocked), allowMirror, limit });
    if (!cancelled) (self as any).postMessage({ type: 'done', solutions: res.rows });
  }
};
export {}; // make it a module
