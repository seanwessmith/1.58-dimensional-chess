import { useState } from "react";
import UserProfile from "./profile";
import PromotionModal from "./promotion-medal";
import ChessPiece from "./chess-piece";
import {
  isLegalMoveBishop,
  isLegalMoveKing,
  isLegalMoveKnight,
  isLegalMovePawn,
  isLegalMoveQueen,
  isLegalMoveRook,
} from "../utils/legality";
import { getColor, type PieceI } from "../utils/piece";

interface PieceMap {
  [key: string]: PieceI;
}

export interface Player {
  username: string;
  capturedPieces: PieceI[];
  timeLeft: string;
}

const ACTIVE_SQUARES = [
  "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8",
  "b2", "b4", "b6", "b8",
  "c3", "c4", "c7", "c8",
  "d4", "d8",
  "e5", "e6", "e7", "e8",
  "f6", "f8",
  "g7", "g8",
  "h8",
];

const DEFAULT_PIECES: PieceMap = {
  a1: "K",
  a2: "Q",
  a3: "B",
  a4: "P",
  b2: "R",
  b4: "N",
  c3: "P",
  e7: "n",
  e8: "p",
  f6: "p",
  f8: "b",
  g7: "r",
  g8: "q",
  h8: "k",
};

const BOARD_SIZE = 8;

const Chessboard = () => {
  const [promotionSquare, setPromotionSquare] = useState<{
    square: string;
    piece: PieceI;
  } | null>(null);
  const [dragStartSquare, setDragStartSquare] = useState<string | null>(null);
  const [pieces, setPieces] = useState<PieceMap>({ ...DEFAULT_PIECES });
  const [players, setPlayers] = useState<{ white: Player; black: Player }>({
    white: { username: "white", capturedPieces: [], timeLeft: "1:15" },
    black: { username: "black", capturedPieces: [], timeLeft: "1:42" },
  });

  const currentPiece = dragStartSquare ? pieces[dragStartSquare] : null;
  const currentColor = currentPiece ? getColor(currentPiece) : null;

  const handlePromotion = (promotionPiece: PieceI) => {
    if (!promotionSquare) return;

    setPieces((prev) => ({
      ...prev,
      [promotionSquare.square]: promotionPiece,
    }));
    setPromotionSquare(null);
  };

  const isLegalMove = (from: string, to: string): boolean => {
    if (!ACTIVE_SQUARES.includes(to)) return false;

    const piece = pieces[from];
    if (!piece) return false;

    const color = getColor(piece);
    if (!color) return false;

    switch (piece.toLowerCase()) {
      case "p":
        return isLegalMovePawn(ACTIVE_SQUARES, pieces, color, from, to);
      case "n":
        return isLegalMoveKnight(from, to, color, pieces);
      case "b":
        return isLegalMoveBishop(ACTIVE_SQUARES, pieces, color, from, to);
      case "r":
        return isLegalMoveRook(ACTIVE_SQUARES, pieces, color, from, to);
      case "q":
        return isLegalMoveQueen(ACTIVE_SQUARES, pieces, color, from, to);
      case "k":
        return isLegalMoveKing(ACTIVE_SQUARES, pieces, color, from, to);
      default:
        return false;
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLSpanElement>,
    square: string
  ) => {
    if (promotionSquare) return;

    setDragStartSquare(square);
    e.dataTransfer.setData("text/plain", square);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) =>
    e.preventDefault();

  const handleDrop = (
    e: React.DragEvent<HTMLTableCellElement>,
    toSquare: string
  ) => {
    e.preventDefault();

    if (promotionSquare || !dragStartSquare || !currentPiece) return;
    if (!isLegalMove(dragStartSquare, toSquare)) return;

    const captured = pieces[toSquare];
    if (captured) {
      const capturingPlayer = getColor(captured) === "white" ? "black" : "white";

      setPlayers((prev) => ({
        ...prev,
        [capturingPlayer]: {
          ...prev[capturingPlayer],
          capturedPieces: [...prev[capturingPlayer].capturedPieces, captured],
        },
      }));
    }

    if (
      (currentColor === "white" && currentPiece === "P" && toSquare[1] === "8") ||
      (currentColor === "black" && currentPiece === "p" && toSquare[0] === "a")
    ) {
      setPromotionSquare({ square: toSquare, piece: currentPiece });
    }

    setPieces((prev) => {
      const updated = { ...prev, [toSquare]: prev[dragStartSquare] };
      delete updated[dragStartSquare];
      return updated;
    });
    setDragStartSquare(null);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1a1a2e,_#16213e_40%,_#0f0f23)] px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-center">
          <div className="flex min-w-0 flex-1 flex-col gap-4 lg:max-w-xs">
            <UserProfile player={players.black} />
          </div>

          <div className="relative mx-auto rounded-2xl bg-amber-950/60 p-3 shadow-[0_28px_80px_rgba(0,0,0,0.5)]">
            <table className="select-none table-fixed border-separate border-spacing-0 overflow-hidden rounded-lg">
              <tbody>
                {[...Array(BOARD_SIZE)].map((_, row) => (
                  <tr key={row}>
                    {[...Array(BOARD_SIZE)].map((_, col) => {
                      const file = String.fromCharCode(97 + col);
                      const rank = BOARD_SIZE - row;
                      const square = `${file}${rank}`;
                      const isActive = ACTIVE_SQUARES.includes(square);
                      const isLight = (row + col) % 2 === 0;
                      const isSelected = dragStartSquare === square;
                      let cellClasses =
                        "relative h-14 w-14 p-0 text-center align-middle md:h-16 md:w-16 lg:h-[4.75rem] lg:w-[4.75rem]";

                      if (isActive) {
                        if (isSelected) {
                          cellClasses += " bg-amber-300/80";
                        } else if (isLight) {
                          cellClasses += " bg-[#f0d9b5]";
                        } else {
                          cellClasses += " bg-[#b58863]";
                        }
                      } else {
                        cellClasses += " bg-[#1a1a2e]";
                      }

                      const isLegalTarget =
                        isActive &&
                        dragStartSquare &&
                        dragStartSquare !== square &&
                        isLegalMove(dragStartSquare, square);

                      return (
                        <td
                          key={col}
                          className={cellClasses}
                          onDrop={(event) => handleDrop(event, square)}
                          onDragOver={handleDragOver}
                        >
                          {isLegalTarget && !pieces[square] && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <div className="h-4 w-4 rounded-full bg-black/20" />
                            </div>
                          )}
                          {isLegalTarget && pieces[square] && (
                            <div className="pointer-events-none absolute inset-0 rounded-sm ring-4 ring-inset ring-black/20" />
                          )}
                          {pieces[square] && (
                            <div className="flex h-full items-center justify-center">
                              <ChessPiece
                                piece={pieces[square]}
                                size="md"
                                className="cursor-grab active:cursor-grabbing"
                                draggable
                                onDragStart={(event) =>
                                  handleDragStart(event, square)
                                }
                              />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4 lg:max-w-xs">
            <UserProfile player={players.white} />
          </div>
        </div>

        <PromotionModal
          promotionSquare={promotionSquare}
          isOpen={Boolean(promotionSquare)}
          onClose={handlePromotion}
        />
      </div>

      <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <p className="font-bold tracking-wide text-slate-200">Rules</p>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-400">
          <li>
            The board is a normal 8x8, but only 27 open squares. The other 37
            squares are inaccessible.
          </li>
          <li>
            White pawns move up and capture diagonally up-left or up-right.
            Black pawns move left and capture diagonally left-up or left-down.
          </li>
          <li>
            White pawns promote on rank 8, black pawns promote on file a.
          </li>
          <li>No en passant, castling, or two-step pawn jumps.</li>
          <li>
            Sliding pieces cannot move onto or through covered squares. Knights
            only need their landing square to be open.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Chessboard;
