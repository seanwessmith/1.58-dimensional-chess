import ChessPiece from "./chess-piece";
import { reverseMapPiece, type PieceI } from "../utils/piece";

interface Props {
  promotionSquare: { square: string; piece: PieceI } | null;
  isOpen: boolean;
  onClose: (pieceSelected: PieceI) => void;
}

const PromotionModal = ({ promotionSquare, isOpen, onClose }: Props) => {
  if (!isOpen || !promotionSquare) {
    return null;
  }

  const pieceColor =
    promotionSquare.piece === promotionSquare.piece.toUpperCase()
      ? "white"
      : "black";
  const pieces = ["queen", "rook", "bishop", "knight"] as const;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/95 p-3 shadow-2xl">
        {pieces.map((piece) => {
          const promotedPiece =
            reverseMapPiece[
              `${pieceColor}-${piece}` as keyof typeof reverseMapPiece
            ];

          return (
            <button
              key={piece}
              type="button"
              className="rounded-xl p-2 transition-colors hover:bg-white/10"
              onClick={() => onClose(promotedPiece)}
            >
              <ChessPiece
                piece={promotedPiece}
                size="lg"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PromotionModal;
