import type { HTMLAttributes } from "react";
import { getColor, pieceGlyphs, pieceNames, type PieceI } from "../utils/piece";

type Props = HTMLAttributes<HTMLSpanElement> & {
  piece: PieceI;
  size?: "sm" | "md" | "lg";
};

const SIZE_STYLES = {
  sm: "text-2xl",
  md: "text-4xl md:text-[2.6rem] lg:text-[2.9rem]",
  lg: "text-5xl",
} as const;

// Unicode chess glyphs render at inconsistent visual sizes.
// Pawn and rook are the baseline; scale others up to match.
const PIECE_SCALE: Partial<Record<PieceI, string>> = {
  K: "scale-[1.3]",
  k: "scale-[1.3]",
  Q: "scale-[1.28]",
  q: "scale-[1.28]",
  B: "scale-[1.32]",
  b: "scale-[1.32]",
  N: "scale-[1.32]",
  n: "scale-[1.32]",
};

export default function ChessPiece({
  piece,
  size = "md",
  className = "",
  ...props
}: Props) {
  const isWhite = getColor(piece) === "white";
  const colorClass = isWhite
    ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
    : "text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]";
  const scaleClass = PIECE_SCALE[piece] ?? "";

  return (
    <span
      role="img"
      aria-label={pieceNames[piece]}
      title={pieceNames[piece]}
      className={`inline-flex select-none items-center justify-center leading-none ${SIZE_STYLES[size]} ${scaleClass} ${colorClass} ${className}`.trim()}
      {...props}
    >
      {pieceGlyphs[piece]}
    </span>
  );
}
