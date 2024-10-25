import { getColor } from '../utils/piece';

const isBlockedBishop = (activeSquares: string[], pieces: { [key: string]: string }, pieceColor: string, previousSquare: string, square: string): boolean => {
  // get the file difference
  const fileDiff = previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0);
  // get the rank difference
  const rankDiff = (previousSquare as any)[1] - (square as any)[1];

  // get the direction of the move
  const fileDirection = fileDiff === 0 ? 0 : fileDiff > 0 ? -1 : 1;
  const rankDirection = rankDiff === 0 ? 0 : rankDiff > 0 ? -1 : 1;

  // check the squares between current and destination
  let currentFile = previousSquare[0];
  let currentRank = (previousSquare as any)[1];

  while (currentFile !== square[0] || currentRank !== square[1]) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(0) + fileDirection
    );
    currentRank = String.fromCharCode(
      currentRank.charCodeAt(0) + rankDirection
    );
    console.log('testing ', currentFile + currentRank);
    if (!activeSquares.includes(currentFile + currentRank)) {
      return true;
    }
    if (getColor(pieces[square]) === pieceColor) {
      return true;
    }
  }
  console.log('activeSquares', activeSquares);
  console.log('final testing ', currentFile + currentRank);
  if (!activeSquares.includes(currentFile + currentRank)) {
    return true;
  }

  return false;
};

const isBlockedPawn = (activeSquares: string[], pieces: { [key: string]: string }, pieceColor: string, previousSquare: string, square: string): boolean => {
  // get the file difference
  const fileDiff = previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0);
  // get the rank difference
  const rankDiff = (previousSquare as any)[1] - (square as any)[1];

  // get the direction of the move
  const fileDirection = fileDiff === 0 ? 0 : fileDiff > 0 ? -1 : 1;
  const rankDirection = rankDiff === 0 ? 0 : rankDiff > 0 ? -1 : 1;

  // check the squares between current and destination
  let currentFile = previousSquare[0];
  let currentRank = (previousSquare as any)[1];

  while (currentFile !== square[0] || currentRank !== square[1]) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(0) + fileDirection
    );
    currentRank = String.fromCharCode(
      currentRank.charCodeAt(0) + rankDirection
    );
    if (!activeSquares.includes(currentFile + currentRank)) {
      return true;
    }
    if (getColor(pieces[square]) === pieceColor) {
      return true;
    }
  }

  return false;
};

const isBlockedRook = (activeSquares: string[], pieces: { [key: string]: string }, pieceColor: string, previousSquare: string, square: string): boolean => {
  // get the file difference
  const fileDiff = previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0);
  // get the rank difference
  const rankDiff = (previousSquare as any)[1] - (square as any)[1];

  // get the direction of the move
  const fileDirection = fileDiff === 0 ? 0 : fileDiff > 0 ? -1 : 1;
  const rankDirection = rankDiff === 0 ? 0 : rankDiff > 0 ? -1 : 1;

  // check the squares between current and destination
  let currentFile = previousSquare[0];
  let currentRank = (previousSquare as any)[1];

  while (currentFile !== square[0] || currentRank !== square[1]) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(0) + fileDirection
    );
    currentRank = String.fromCharCode(
      currentRank.charCodeAt(0) + rankDirection
    );
    if (!activeSquares.includes(currentFile + currentRank)) {
      return true;
    }
    if (getColor(pieces[square]) === pieceColor) {
      return true;
    }
  }

  return false;
};
const isBlockedQueen = (activeSquares: string[], pieces: { [key: string]: string }, pieceColor: string, previousSquare: string, square: string): boolean => {
  // get the file difference
  const fileDiff = previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0);
  // get the rank difference
  const rankDiff = (previousSquare as any)[1] - (square as any)[1];

  // get the direction of the move
  const fileDirection = fileDiff === 0 ? 0 : fileDiff > 0 ? -1 : 1;
  const rankDirection = rankDiff === 0 ? 0 : rankDiff > 0 ? -1 : 1;

  // check the squares between current and destination
  let currentFile = previousSquare[0];
  let currentRank = (previousSquare as any)[1];

  while (currentFile !== square[0] || currentRank !== square[1]) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(0) + fileDirection
    );
    currentRank = String.fromCharCode(
      currentRank.charCodeAt(0) + rankDirection
    );
    if (!activeSquares.includes(currentFile + currentRank)) {
      return true;
    }
    if (getColor(pieces[square]) === pieceColor) {
      return true;
    }
  }

  return false;
};

const isLegalMovePawn = (activeSquares: string[], pieces: { [key: string]: string }, pieceColor: string, previousSquare: string, square: string) => {
  // check if pawn is moving onto square with same color piece
  if (pieceColor === getColor(pieces[square])) return false;

  // get the rank difference
  const rankDiff = (previousSquare as any)[1] - (square as any)[1];
  // get the file difference
  const fileDiff = previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0);

  // check if the pawn is moving in the correct direction
  if (
    (pieceColor === "white" && rankDiff !== -1) ||
    (pieceColor === "black" && fileDiff !== 1)
  )
    return false;

  return !isBlockedPawn(activeSquares, pieces, pieceColor, previousSquare, square);
};

const isLegalMoveKnight = (
  previousSquare: string,
  square: string,
  pieceColor: string,
  pieces: { [key: string]: string }
): boolean => {
  // check if pawn is moving onto square with same color piece
  if (pieceColor === getColor(pieces[square])) return false;
  // get the file difference
  const fileDiff = Math.abs(
    previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0)
  );
  // get the rank difference
  const rankDiff = Math.abs((previousSquare as any)[1] - (square as any)[1]);
  // check if the move is L shape
  if (
    (rankDiff === 2 && fileDiff === 1) ||
    (rankDiff === 1 && fileDiff === 2)
  )
    return true;
  return false;
};

const isLegalMoveBishop = (
  activeSquares: string[],
  pieces: { [key: string]: string },
  pieceColor: string,
  previousSquare: string,
  square: string
): boolean => {
  if (!previousSquare) return false;
  // get the file difference
  const fileDiff = Math.abs(
    previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0)
  );
  // get the rank difference
  const rankDiff = Math.abs((previousSquare as any)[1] - (square as any)[1]);

  // check if the move is diagonal
  if (fileDiff !== rankDiff) return false;

  //check if the path is blocked
  return !isBlockedBishop(activeSquares, pieces, pieceColor, previousSquare, square);
};

const isLegalMoveRook = (activeSquares: string[], pieces: { [key: string]: string }, pieceColor: string, previousSquare: string, square: string): boolean => {
  if (!previousSquare) return false;
  // get the file difference
  const fileDiff = previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0);
  // get the rank difference
  const rankDiff = (previousSquare as any)[1] - (square as any)[1];

  // check if the move is horizontal or vertical
  if (fileDiff !== 0 && rankDiff !== 0) return false;

  //check if the path is blocked
  return !isBlockedRook(activeSquares, pieces, pieceColor, previousSquare, square);
};

const isLegalMoveQueen = (
  activeSquares: string[],
  pieces: { [key: string]: string },
  pieceColor: string,
  previousSquare: string,
  square: string
): boolean => {
  if (!previousSquare) return false;
  // check if pawn is moving onto square with same color piece
  if (pieceColor === getColor(pieces[square])) return false;
  // get the file difference
  const fileDiff = previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0);
  // get the rank difference
  const rankDiff = (previousSquare as any)[1] - (square as any)[1];

  // check if the move is diagonal, horizontal or vertical
  if (fileDiff !== rankDiff && fileDiff !== 0 && rankDiff !== 0) return false;

  // check if the path is blocked
  return !isBlockedQueen(activeSquares, pieces, pieceColor, previousSquare, square);
};

const isLegalMoveKing = (
  previousSquare: string,
  square: string,
  pieceColor: string,
  pieces: { [key: string]: string }
): boolean => {
  // check if pawn is moving onto square with same color piece
  if (pieceColor === getColor(pieces[square])) return false;
  // get the file difference
  const fileDiff = Math.abs(
    previousSquare[0].charCodeAt(0) - square[0].charCodeAt(0)
  );
  // get the rank difference
  const rankDiff = Math.abs((previousSquare as any)[1] - (square as any)[1]);
  // check if the move is L shape
  if (
    (rankDiff === 1 && fileDiff === 1) ||
    (rankDiff === 1 && fileDiff === 0) ||
    (rankDiff === 0 && fileDiff === 1)
  )
    return true;
  return false;
};

export {
  isLegalMovePawn,
  isLegalMoveKnight,
  isLegalMoveBishop,
  isLegalMoveRook,
  isLegalMoveQueen,
  isLegalMoveKing,
}