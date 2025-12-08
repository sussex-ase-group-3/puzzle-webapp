// web/src/features/polysphere/page/PolyspherePage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { PolysphereBoard } from "../components/PolysphereBoard";
import { PiecePalette, DND_MIME } from "../components/PiecePalette";
import { PIECE_SHAPES, toOffsets } from "../pieces";
import {
  ALL_PIECES,
  Board,
  emptyBoard,
  rotateOffsets,
  flipHOffsets,
  canPlace,
  place,
  erasePiece,
  remainingFromAllowed,
  piecesPresent,
} from "../utils";
import {
  startPolysphereSolver,
  getNextPolysphereSolutions,
  streamPolysphereSolutions,
  cancelPolysphereSolver,
} from "../api";
import { SolutionGrid } from "../components/SolutionGrid";

//icons
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2v20l18-10L4 2z" />
  </svg>
);
const StreamIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3v18l14-9L5 3z" />
  </svg>
);
const CancelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" stroke="currentColor" />
  </svg>
);
const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.46-.57 2.78-1.5 3.75l1.42 1.42C19.07 15.46 20 13.83 20 12c0-4.42-3.58-8-8-8zM6.08 6.08L4.66 7.5C3.57 8.62 3 10.26 3 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.46.57-2.78 1.5-3.75l-1.42-1.42z" />
  </svg>
);

const Button = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: styleProp,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "primary" | "danger";
  style?: React.CSSProperties;
}) => {
  const baseStyle: React.CSSProperties = {
    padding: "10px 18px",
    borderRadius: 8,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    border: "1px solid transparent",
    outline: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxShadow: disabled ? "none" : "0 2px 6px rgba(0,0,0,0.15)",
    transform: "scale(1)",
    userSelect: "none",
  };

  const variants: Record<string, React.CSSProperties> = {
    default: { background: "#1b353c", color: "#ffffffff", borderColor: "#ccc" },
    primary: { background: "#1b353c", color: "#ffffffff", borderColor: "#187bb5" },
    danger: { background: "#dc2c2cff", color: "#ffffffff", borderColor: "#b0170c" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...(variant in variants ? variants[variant] : {}),
        ...(disabled
          ? { opacity: 0.6, cursor: "not-allowed", boxShadow: "none" }
          : {}),
        ...styleProp,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.filter = "brightness(1.1)";
          e.currentTarget.style.transform = "scale(1.03)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.filter = "brightness(1)";
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.97)";
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(1.03)";
      }}
    >
      {children}
    </button>
  );
};

type DragPayload = { pieceId: number; turns: 0 | 1 | 2 | 3; flip: boolean };

export function PolyspherePage() {
  // editor state
  const [draft, setDraft] = useState<Board>(() => emptyBoard());
  const [allowed, setAllowed] = useState<number[]>(() => [...ALL_PIECES]);

  // palette state
  const [selected, setSelected] = useState<number>(1);
  const [turns, setTurns] = useState<0 | 1 | 2 | 3>(0);
  const [flip, setFlip] = useState<boolean>(false);

  // solver state
  const [active, setActive] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [solutions, setSolutions] = useState<{ board: Board }[]>([]);
  const solutionsCountRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [maxSolutions, setMaxSolutions] = useState<number>(1000);

  // infinite scroll
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // preview cells for drag-over ghost
  const [preview, setPreview] = useState<Set<string> | null>(null);

  // disable palette buttons for pieces already placed
  const placed = useMemo(() => piecesPresent(draft), [draft]);
  const disabledIds = placed;

  //drag-n-drop
  const onDragOverBoard = (e: React.DragEvent<HTMLDivElement>) => {
    const data = e.dataTransfer.getData(DND_MIME);
    if (!data) {
      setPreview(null);
      return;
    }
    let payload: DragPayload;
    try {
      payload = JSON.parse(data);
    } catch {
      setPreview(null);
      return;
    }

    const cell = (e.target as HTMLElement).closest(
      "[data-cell]"
    ) as HTMLElement | null;
    if (!cell) {
      setPreview(null);
      return;
    }
    const [r0, c0] = cell.dataset.cell!.split(",").map(Number);

    const base = toOffsets(PIECE_SHAPES[payload.pieceId]);
    let offsets = rotateOffsets(base, payload.turns);
    if (payload.flip) offsets = flipHOffsets(offsets);

    const ghost = new Set<string>();
    for (const [dr, dc] of offsets) {
      const r = r0 + dr,
        c = c0 + dc;
      if (r >= 0 && r < draft.length && c >= 0 && c < draft[0].length) {
        ghost.add(`${r},${c}`);
      }
    }
    setPreview(ghost);
  };

  const onDropOnBoard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setPreview(null);
    const data = e.dataTransfer.getData(DND_MIME);
    if (!data) return;

    let payload: DragPayload;
    try {
      payload = JSON.parse(data);
    } catch {
      return;
    }

    const cell = (e.target as HTMLElement).closest(
      "[data-cell]"
    ) as HTMLElement | null;
    if (!cell) return;
    const [r0, c0] = cell.dataset.cell!.split(",").map(Number);

    const base = toOffsets(PIECE_SHAPES[payload.pieceId]);
    let offsets = rotateOffsets(base, payload.turns);
    if (payload.flip) offsets = flipHOffsets(offsets);

    if (!canPlace(draft, offsets, r0, c0)) {
      setError("Can't place piece there (overlap or out of bounds).");
      return;
    }

    setDraft((b) => place(b, offsets, r0, c0, payload.pieceId));
    setAllowed((a) => a.filter((id) => id !== payload.pieceId));
  };

  const onCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    if (e.button === 2) {
      const pid = draft[r][c];
      if (pid > 0) {
        setDraft((b) => erasePiece(b, r, c));
        setAllowed((a) =>
          Array.from(new Set([...a, pid])).sort((x, y) => x - y)
        );
      }
    }
  };

  const onStart = async () => {
    setError(null);
    setDoneMessage(null);
    setSolutions([]);
    solutionsCountRef.current = 0;
    setActive(false);
    try {
      const remaining = remainingFromAllowed([...ALL_PIECES], draft);
      await startPolysphereSolver({
        board: draft,
        remainingPieces: remaining,
        maxSolutions: maxSolutions,
      });
      setActive(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to start solver");
    }
  };

  const onNextBatch = async () => {
    if (!active) {
      setError("Start the solver first");
      return;
    }
    setError(null);
    setDoneMessage(null);
    try {
      const res = await getNextPolysphereSolutions(10);
      const incoming = res.solutions.length;
      const before = solutionsCountRef.current;
      if (incoming > 0) {
        setSolutions((prev) => {
          const next = [...prev, ...res.solutions];
          solutionsCountRef.current = next.length;
          return next;
        });
      }
      if (res.isComplete) {
        setActive(false);
        const total = before + incoming;
        setDoneMessage(
          total === 0
            ? "No solutions found for this configuration."
            : "No more solutions."
        );
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to get next solutions");
    }
  };

  const onStream = async () => {
    setError(null);
    setDoneMessage(null);
    if (!active) {
      try {
        await onStart();
      } catch {
        return;
      }
    }

    setStreaming(true);
    const es = streamPolysphereSolutions(200);
    esRef.current = es;

    const end = () => {
      setStreaming(false);
      setActive(false);
      esRef.current?.close();
      esRef.current = null;
    };
    es.addEventListener("batch", (evt: MessageEvent) => {
      try {
        const data = JSON.parse(evt.data);
        setSolutions((prev) => {
          const next = [...prev, ...data.solutions];
          solutionsCountRef.current = next.length;
          return next;
        });
      } catch {}
    });

    es.addEventListener("complete", () => {
      end();
      const count = solutionsCountRef.current;
      setDoneMessage(
        count === 0
          ? "No solutions found for this configuration."
          : "No more solutions."
      );
    });

    es.addEventListener("error", () => {
      setError("Stream error");
      end();
    });
  };

  const onCancel = async () => {
    setStreaming(false);
    esRef.current?.close();
    esRef.current = null;
    try {
      await cancelPolysphereSolver();
    } catch {}
    setActive(false);
    setDoneMessage(null);
  };

  useEffect(() => () => esRef.current?.close(), []);

  const latest = solutions.length ? solutions[solutions.length - 1] : null;
  const display = latest?.board ?? draft;


  useEffect(() => {
    if (!galleryRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0];

        if (
          lastEntry.isIntersecting &&
          active &&
          !streaming &&
          !isFetching &&
          !doneMessage
        ) {
          setIsFetching(true);
          onNextBatch().finally(() => setIsFetching(false));
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    const sentinel = document.getElementById("solutions-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [active, streaming, isFetching, doneMessage, solutions]);

  
  useEffect(() => {
    if (!galleryRef.current) return;
    const gallery = galleryRef.current;

    const isNearBottom =
      gallery.scrollHeight - gallery.scrollTop - gallery.clientHeight < 100;

    if (isNearBottom) {
      gallery.scrollTo({
        top: gallery.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [solutions]);

  return (
    <div>
      <h1>Polysphere</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 360px) 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        
        <div style={{ display: "grid", gap: 12 }}>
          <PiecePalette
            selected={selected}
            setSelected={setSelected}
            turns={turns}
            setTurns={setTurns}
            flip={flip}
            setFlip={setFlip}
            disabledIds={disabledIds}
          />

          
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Button onClick={onStart} variant="primary" style={{ flex: "1 1 120px" }}>
              <PlayIcon /> Start
            </Button>

            <Button onClick={onNextBatch} disabled={!active || streaming} style={{ flex: "1 1 120px" }}>
              Next 10
            </Button>

            <Button onClick={onStream} disabled={streaming} variant="primary" style={{ flex: "1 1 140px" }}>
              <StreamIcon /> {streaming ? "Streaming…" : "Stream"}
            </Button>

            <input
              type="number"
              value={maxSolutions}
              onChange={(e) => setMaxSolutions(parseInt(e.target.value) || 1000)}
              min={1}
              max={100000}
              style={{
                flex: "0 0 80px",
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid #ccc",
                textAlign: "center",
              }}
              disabled={streaming}
              title="Maximum solutions for streaming"
            />

            <Button onClick={onCancel} variant="danger" style={{ flex: "1 1 120px" }}>
              <CancelIcon /> Cancel
            </Button>

            <Button
              onClick={() => {
                setDraft(emptyBoard());
                setSolutions([]);
                solutionsCountRef.current = 0;
                setActive(false);
                setStreaming(false);
                setAllowed([...ALL_PIECES]);
                setDoneMessage(null);
                setError(null);
              }}
              style={{ flex: "1 1 120px" }}
            >
              <ResetIcon /> Reset
            </Button>
          </div>

          {error && <div style={{ color: "crimson" }}>{error}</div>}
          {doneMessage && (
            <div
              style={{
                color: "#f3033fff",
                background: "#b2edf9ff",
                border: "1px solid #c3e6cb",
                padding: "8px 10px",
                borderRadius: 6,
                fontWeight: 500,
              }}
            >
              {doneMessage}
            </div>
          )}
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            {latest ? "Latest solution" : "Editor (drag a piece, right-click to erase)"}
          </div>
          <PolysphereBoard
            board={display}
            previewCells={preview ?? undefined}
            editable={!latest}
            onCellMouseDown={onCellMouseDown}
            onCellMouseEnter={() => {}}
            onDragOverBoard={onDragOverBoard}
            onDropOnBoard={onDropOnBoard}
          />
        </div>
      </div>

      {solutions.length > 0 && (
        <div style={{ marginTop: 20, maxHeight: "500px", overflowY: "auto" }} ref={galleryRef}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            All solutions ({solutions.length})
          </div>
          <SolutionGrid
            solutions={solutions}
            onSelect={(idx) => {
              setSolutions((prev) => {
                const sel = prev[idx];
                return [...prev.slice(0, idx), ...prev.slice(idx + 1), sel];
              });
            }}
            columns="repeat(auto-fill, minmax(150px, 1fr))"
            itemTitle={(i) => `Solution ${i + 1}`}
          />
          <div id="solutions-sentinel" style={{ height: 1 }}></div>
          {isFetching && <div style={{ padding: 8, textAlign: "center" }}>Loading more solutions…</div>}
        </div>
      )}
    </div>
  );
}
