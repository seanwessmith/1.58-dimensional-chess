import { getColor, type PieceColor } from "./piece";

type PieceMap = Record<string, string>;

const toCoords = (square: string) => ({
  file: square.charCodeAt(0) - 97,
  rank: Number(square[1]),
});

const toSquare = (file: number, rank: number) =>
  `${String.fromCharCode(97 + file)}${rank}`;

const canOccupySquare = (
  activeSquares: string[],
  pieces: PieceMap,
  pieceColor: PieceColor,
  square: string
) =>
  activeSquares.includes(square) && getColor(pieces[square]) !== pieceColor;

const isSlidingPathClear = (
  activeSquares: string[],
  pieces: PieceMap,
  previousSquare: string,
  square: string
) => {
  const from = toCoords(previousSquare);
  const to = toCoords(square);
  const fileStep = Math.sign(to.file - from.file);
  const rankStep = Math.sign(to.rank - from.rank);

  let currentFile = from.file + fileStep;
  let currentRank = from.rank + rankStep;

  while (currentFile !== to.file || currentRank !== to.rank) {
    const currentSquare = toSquare(currentFile, currentRank);

    if (!activeSquares.includes(currentSquare) || pieces[currentSquare]) {
      return false;
    }

    currentFile += fileStep;
    currentRank += rankStep;
  }

  return activeSquares.includes(square);
};

export const isLegalMovePawn = (
  activeSquares: string[],
  pieces: PieceMap,
  pieceColor: PieceColor,
  previousSquare: string,
  square: string
) => {
  if (!canOccupySquare(activeSquares, pieces, pieceColor, square)) return false;

  const from = toCoords(previousSquare);
  const to = toCoords(square);
  const fileDiff = to.file - from.file;
  const rankDiff = to.rank - from.rank;
  const destinationOccupied = Boolean(pieces[square]);

  if (pieceColor === "white") {
    if (destinationOccupied) {
      return rankDiff === 1 && Math.abs(fileDiff) === 1;
    }

    return fileDiff === 0 && rankDiff === 1;
  }

  if (destinationOccupied) {
    return fileDiff === -1 && Math.abs(rankDiff) === 1;
  }

  return fileDiff === -1 && rankDiff === 0;
};

export const isLegalMoveKnight = (
  previousSquare: string,
  square: string,
  pieceColor: PieceColor,
  pieces: PieceMap
): boolean => {
  if (pieceColor === getColor(pieces[square])) return false;

  const from = toCoords(previousSquare);
  const to = toCoords(square);
  const fileDiff = Math.abs(from.file - to.file);
  const rankDiff = Math.abs(from.rank - to.rank);

  return (
    (rankDiff === 2 && fileDiff === 1) ||
    (rankDiff === 1 && fileDiff === 2)
  );
};

export const isLegalMoveBishop = (
  activeSquares: string[],
  pieces: PieceMap,
  pieceColor: PieceColor,
  previousSquare: string,
  square: string
): boolean => {
  if (!canOccupySquare(activeSquares, pieces, pieceColor, square)) return false;

  const from = toCoords(previousSquare);
  const to = toCoords(square);
  const fileDiff = Math.abs(from.file - to.file);
  const rankDiff = Math.abs(from.rank - to.rank);

  if (fileDiff !== rankDiff || fileDiff === 0) return false;

  return isSlidingPathClear(activeSquares, pieces, previousSquare, square);
};

export const isLegalMoveRook = (
  activeSquares: string[],
  pieces: PieceMap,
  pieceColor: PieceColor,
  previousSquare: string,
  square: string
): boolean => {
  if (!canOccupySquare(activeSquares, pieces, pieceColor, square)) return false;

  const from = toCoords(previousSquare);
  const to = toCoords(square);
  const fileDiff = from.file - to.file;
  const rankDiff = from.rank - to.rank;

  if ((fileDiff !== 0 && rankDiff !== 0) || (fileDiff === 0 && rankDiff === 0)) {
    return false;
  }

  return isSlidingPathClear(activeSquares, pieces, previousSquare, square);
};

export const isLegalMoveQueen = (
  activeSquares: string[],
  pieces: PieceMap,
  pieceColor: PieceColor,
  previousSquare: string,
  square: string
): boolean => {
  if (!canOccupySquare(activeSquares, pieces, pieceColor, square)) return false;

  const from = toCoords(previousSquare);
  const to = toCoords(square);
  const fileDiff = Math.abs(from.file - to.file);
  const rankDiff = Math.abs(from.rank - to.rank);
  const isDiagonal = fileDiff === rankDiff && fileDiff > 0;
  const isStraight = (fileDiff === 0 && rankDiff > 0) || (rankDiff === 0 && fileDiff > 0);

  if (!isDiagonal && !isStraight) return false;

  return isSlidingPathClear(activeSquares, pieces, previousSquare, square);
};

export const isLegalMoveKing = (
  activeSquares: string[],
  pieces: PieceMap,
  pieceColor: PieceColor,
  previousSquare: string,
  square: string
): boolean => {
  if (!canOccupySquare(activeSquares, pieces, pieceColor, square)) return false;

  const from = toCoords(previousSquare);
  const to = toCoords(square);
  const fileDiff = Math.abs(from.file - to.file);
  const rankDiff = Math.abs(from.rank - to.rank);

  return Math.max(fileDiff, rankDiff) === 1;
};
