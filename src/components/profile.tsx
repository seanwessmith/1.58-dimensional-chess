import Image from "next/image";
import { ClockIcon } from "@heroicons/react/24/solid";
import { mapPiece } from "@/utils/piece";
import { Player } from "@/app/pages/chessboard";

interface Props {
  player: Player;
}

const UserProfile = ({ player }: Props) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center flex-row justify-between">
        <p className="text-white font-medium">{player.username} (1200)</p>
        <div className="bg-white w-32 flex justify-between h-10 -mb-4 rounded-sm pr-2 pl-2">
          <ClockIcon className="h-6 w-6 text-gray-600 mt-2" />
          <p className="text-gray-600 text-xl leading-10">{player.timeLeft}</p>
        </div>
      </div>
      <div className="flex justify-start bg-white opacity-50 max-w-md h-10">
        {player.capturedPieces.map((piece) => (
          <Image
            src={`/chess-pieces/${mapPiece[piece]}.png`}
            sizes="32"
            alt={piece}
            className={`w-10 h-10`}
            priority
            width={10}
            height={10}
          />
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
