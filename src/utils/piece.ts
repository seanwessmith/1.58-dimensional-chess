export type PieceI =
  | "p"
  | "n"
  | "b"
  | "r"
  | "q"
  | "k"
  | "P"
  | "N"
  | "B"
  | "R"
  | "Q"
  | "K";

export type PieceColor = "white" | "black";

export const reverseMapPiece = {
  "white-rook": "R",
  "white-knight": "N",
  "white-bishop": "B",
  "white-queen": "Q",
  "white-king": "K",
  "white-pawn": "P",
  "black-rook": "r",
  "black-knight": "n",
  "black-bishop": "b",
  "black-queen": "q",
  "black-king": "k",
  "black-pawn": "p",
} as const;

export const pieceGlyphs: Record<PieceI, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

export const pieceNames: Record<PieceI, string> = {
  K: "White king",
  Q: "White queen",
  R: "White rook",
  B: "White bishop",
  N: "White knight",
  P: "White pawn",
  k: "Black king",
  q: "Black queen",
  r: "Black rook",
  b: "Black bishop",
  n: "Black knight",
  p: "Black pawn",
};

export const getColor = (piece?: string | null): PieceColor | "" => {
  if (!piece) return "";
  return piece.toUpperCase() === piece ? "white" : "black";
};
