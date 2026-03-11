import { ClockIcon } from "lucide-react";
import type { Player } from "./chessboard";
import ChessPiece from "./chess-piece";

interface Props {
  player: Player;
}

const UserProfile = ({ player }: Props) => {
  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-slate-200">{player.username} (1200)</p>
        <div className="flex h-10 w-32 items-center justify-between rounded-lg bg-slate-800 px-3 text-white">
          <ClockIcon className="h-5 w-5 text-slate-400" />
          <p className="text-lg tabular-nums">{player.timeLeft}</p>
        </div>
      </div>
      <div className="flex min-h-10 flex-wrap items-center gap-1 rounded-lg bg-white/5 p-2">
        {player.capturedPieces.map((piece, index) => (
          <ChessPiece
            key={index}
            piece={piece}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
