const reverseMapPiece = {
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
};

const mapPiece = {
  R: "white-rook",
  N: "white-knight",
  B: "white-bishop",
  Q: "white-queen",
  K: "white-king",
  P: "white-pawn",
  r: "black-rook",
  n: "black-knight",
  b: "black-bishop",
  q: "black-queen",
  k: "black-king",
  p: "black-pawn",
};

const getColor = (piece: string) =>
  piece ? (piece.toUpperCase() === piece ? "white" : "black") : "";

export {
  reverseMapPiece,
  mapPiece,
  getColor,
}