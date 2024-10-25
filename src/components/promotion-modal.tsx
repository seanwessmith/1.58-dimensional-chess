import Image from "next/image";
import { reverseMapPiece } from "../utils/piece";

interface Props {
  promotionSquare: { square: string; piece: string } | null;
  isOpen: boolean;
  onClose: (pieceSelected: string) => void;
}

const PromotionModal = ({ promotionSquare, isOpen, onClose }: Props) => {
  // use state to track the visibility of the modal
  // const [modalIsOpen, setModalIsOpen] = useState(isOpen);

  if (!isOpen || !promotionSquare) {
    return null;
  }
  const pieceColor =
    promotionSquare.piece === promotionSquare.piece.toUpperCase()
      ? "white"
      : "black";
  const pieces = ["queen", "rook", "bishop", "knight"];

  return (
    <div className="absolute top-0 left-0 w-16 z-50 flex">
      <div className="flex flex-col items-center relative h-64 bg-white">
        {pieces.map((piece) => (
          <Image
            key={piece}
            src={`/chess-pieces/${pieceColor}-${piece}.png`}
            alt={piece}
            className="w-20 h-20 cursor-pointer hover:opacity-90"
            width="32"
            height="32"
            onClick={() => {
              // setModalIsOpen(false);
              onClose(
                reverseMapPiece[
                  `${pieceColor}-${piece}` as keyof typeof reverseMapPiece
                ]
              );
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PromotionModal;
