import React from "react";

//icons
const SolveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2v20l18-10L4 2z" />
  </svg>
);
const PrevIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
const NextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 6l6 6-6 6" />
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
  variant?: "default" | "primary";
  style?: React.CSSProperties;
}) => {
  const baseStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: 6,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    border: "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transform: "scale(1)",
    boxShadow: disabled ? "none" : "0 2px 6px rgba(0,0,0,0.15)",
  };

  const variants: Record<string, React.CSSProperties> = {
    default: { background: "#1b353c", color: "#ffffffff", borderColor: "#051317ff" },
    primary: { background: "#1b353c", color: "#fff", borderColor: "#051317ff" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...(variant in variants ? variants[variant] : {}),
        ...(disabled ? { opacity: 0.6, cursor: "not-allowed", boxShadow: "none" } : {}),
        ...styleProp,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.filter = "brightness(1.15)";
          e.currentTarget.style.transform = "scale(1.05)";
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
        if (!disabled) e.currentTarget.style.transform = "scale(1.05)";
      }}
    >
      {children}
    </button>
  );
};

//controls for n-queens
export function Controls({
  n,
  setN,
  count,
  index,
  prev,
  next,
  solve,
  solving,
}: {
  n: number;
  setN: (v: number) => void;
  count: number;
  index: number;
  prev: () => void;
  next: () => void;
  solve: () => void;
  solving: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        padding: "12px 12px",
        marginTop: 12,
        marginBottom: 20,
        background: "#f5f5f5",
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(140, 139, 139, 1)",
      }}
    >
      <label style={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
        N:
        <input
          type="number"
          min={1}
          max={20}
          value={n}
          onChange={(e) => setN(+e.target.value)}
          style={{
            width: 72,
            marginLeft: 8,
            marginRight: 8,
            padding: "6px 8px",
            borderRadius: 6,
            border: "1px solid #aaa",
            fontWeight: 600,
          }}
        />
      </label>

      <Button onClick={solve} disabled={solving} variant="primary">
        <SolveIcon /> {solving ? "Solving…" : "Solve"}
      </Button>

      <Button onClick={prev} disabled={!count}>
        <PrevIcon /> Prev
      </Button>

      <Button onClick={next} disabled={!count}>
        Next <NextIcon />
      </Button>

      <span style={{ marginLeft: 8, fontWeight: 600 }}>
        {count ? `Solution ${index + 1}/${count}` : "No solutions yet"}
      </span>
    </div>
  );
}
