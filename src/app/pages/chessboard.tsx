"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import UserProfile from "../../components/profile";
import PromotionModal from "../../components/promotion-modal";
import {
  isLegalMoveBishop,
  isLegalMoveKnight,
  isLegalMovePawn,
  isLegalMoveQueen,
  isLegalMoveRook,
} from "../../utils/legality";
import { mapPiece, getColor } from "../../utils/piece";

type PieceI =
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

interface Piece {
  [key: string]: string;
}

export interface Player {
  username: string;
  capturedPieces: PieceI[];
  timeLeft: string;
}

const Chessboard = () => {
  useEffect(() => {
    const asyncEffect = async () => {
      const res = await fetch("/api/games");
      console.log(res);
    };
    asyncEffect();
  }, []);

  // define the array of active squares
  const activeSquares = [
    "a1",
    "a2",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "a8",
    "b2",
    "b4",
    "b6",
    "b8",
    "c3",
    "c4",
    "c7",
    "c8",
    "d4",
    "d8",
    "e5",
    "e6",
    "e7",
    "e8",
    "g7",
    "g8",
    "f6",
    "f8",
    "h8",
  ];

  //define the object of pieces
  const defaultPieces = {
    a1: "K",
    a2: "Q",
    b2: "R",
    a3: "B",
    c3: "P",
    a4: "P",
    b4: "N",
    h8: "k",
    g8: "q",
    g7: "r",
    f8: "b",
    f6: "p",
    e8: "p",
    e7: "n",
  };

  const [promotionSquare, setPromotionSquare] = useState<{
    square: string;
    piece: string;
  } | null>(null);
  const [dragStartSquare, setDragStartSquare] = useState<string | null>(null);
  const [pieces, setPieces] = useState<Piece>(defaultPieces);
  const [players, setPlayers] = useState<{ white: Player; black: Player }>({
    white: {
      username: "seanwessmith",
      capturedPieces: [],
      timeLeft: "1:15",
    },
    black: {
      username: "pyzalien",
      capturedPieces: [],
      timeLeft: "1:42",
    },
  });

  const piece = dragStartSquare ? pieces[dragStartSquare] : "";
  const pieceColor = getColor(piece);

  const handlePromotion = (promotionPiece: string) => {
    if (!promotionSquare) return;
    const newPieces = { ...pieces };
    newPieces[promotionSquare.square] = promotionPiece;
    setPieces(newPieces);
    setPromotionSquare(null);
  };

  const isLegalMove = (dragStartSquare: string, square: string) => {
    // if outsite bounds of board then return false
    if (!activeSquares.includes(square)) return false;

    const piece = pieces[dragStartSquare as keyof typeof pieces];

    // validate pawn move
    if (piece.toLowerCase() === "p") {
      return isLegalMovePawn(
        activeSquares,
        pieces,
        pieceColor,
        dragStartSquare,
        square
      );
    }
    // validate knight move
    if (piece.toLowerCase() === "n")
      return isLegalMoveKnight(dragStartSquare, square, pieceColor, pieces);
    // validate bishop move
    if (piece.toLowerCase() === "b")
      return isLegalMoveBishop(
        activeSquares,
        pieces,
        pieceColor,
        dragStartSquare,
        square
      );
    // validate rook move
    if (piece.toLowerCase() === "r")
      return isLegalMoveRook(
        activeSquares,
        pieces,
        pieceColor,
        dragStartSquare,
        square
      );
    // validate queen move
    if (piece.toLowerCase() === "q")
      return isLegalMoveQueen(
        activeSquares,
        pieces,
        pieceColor,
        dragStartSquare,
        square
      );
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLImageElement>,
    piece: string
  ) => {
    setDragStartSquare(piece);
    e.dataTransfer.setData("text/plain", piece);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTableCellElement>,
    square: string
  ) => {
    e.preventDefault();
    if (!dragStartSquare) return;
    if (!isLegalMove(dragStartSquare, square)) {
      return;
    }
    const capturedPiece = pieces[square];
    if (capturedPiece) {
      const color =
        capturedPiece.toLowerCase() === capturedPiece ? "black" : "white";
      setPlayers((p) => ({
        ...p,
        [color]: {
          ...p[color],
          capturedPieces: [...p[color].capturedPieces, capturedPiece],
        },
      }));
    }
    if (
      (pieceColor === "white" && piece === "P" && square[1] === "8") ||
      (pieceColor === "black" && piece === "p" && square[1] === "1")
    ) {
      setPromotionSquare({ square, piece });
    }
    setPieces((prevState) => {
      const state = { ...prevState };
      state[square] = state[dragStartSquare];
      delete state[dragStartSquare];
      return state;
    });
    setDragStartSquare(null);
  };

  useEffect(() => {
    console.log("pieces", JSON.stringify(pieces));
  }, [pieces]);

  return (
    <div className="pb-20">
      <h1 className="text-2xl pb-10 pt-10 text-center">
        1.58 Dimensional Chess
      </h1>
      <div className="relative">
        <PromotionModal
          promotionSquare={promotionSquare}
          isOpen={!!promotionSquare}
          onClose={(pieceSelected: string) => {
            handlePromotion(pieceSelected);
            setPromotionSquare(null);
          }}
        />
        <UserProfile player={players.white} />
        <table className="text-white mt-5 mb-5">
          <tbody>
            {Array.from({ length: 8 }, (_, i) => (
              <tr key={i}>
                {Array.from({ length: 8 }, (_, j) => {
                  const square = `${String.fromCharCode(97 + j)}${8 - i}`;
                  return (
                    <td
                      key={j}
                      className={`p-8 ${
                        activeSquares.includes(square)
                          ? "border-2 border-yellow-500"
                          : "border-0 transparent"
                      } ${
                        activeSquares.includes(square)
                          ? (i + j) % 2 === 0
                            ? "bg-yellow-50"
                            : "bg-sky-600"
                          : "bg-black"
                      } relative`}
                      onDrop={(e) => handleDrop(e, square)}
                      onDragOver={handleDragOver}
                    >
                      {pieces[square as keyof typeof pieces] && (
                        <Image
                          src={`/chess-pieces/${
                            mapPiece[
                              pieces[
                                square as keyof typeof pieces
                              ] as keyof typeof mapPiece
                            ]
                          }.png`}
                          sizes="32"
                          priority
                          alt={pieces[square as keyof typeof pieces]}
                          className={`w-10 h-10`}
                          fill
                          draggable
                          onDragStart={(e) => handleDragStart(e, square)}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <UserProfile player={players.black} />
      </div>
      <div className="text-left max-w-3xl pt-10">
        <p>Rules</p>
        <ul className="list-disc">
          <li>
            The board is still a normal 8x8 board, but there are only 27 open
            squares. The other 37 squares are inaccessible. The rules are the
            same as chess, with a few exceptions:
          </li>
          <li>
            White pawns move up, black pawns move left. White pawns take going
            left-and-up or right-and-up, black pawns take going left-and-down or
            left-and-up. White pawns promote upon reaching the top, black pawns
            promote upon reaching the left.
          </li>
          <li>No en passant, castling, or two-step-forward pawn jumps.</li>
          <li>
            Chess pieces cannot move onto or through the 37 covered squares.
            Knights cannot move onto the 37 covered squares, but don't care what
            they move "through".
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Chessboard;
