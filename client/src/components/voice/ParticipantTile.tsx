import { Volume2 } from "lucide-react";
import type { Participant } from "../../store/voice";
import Avatar from "../ui/Avatar";

type ParticipantTileProps = {
  participant: Participant;
  onVolumeChange: (participantId: string, volume: number) => void;
};

const ParticipantTile = ({ participant, onVolumeChange }: ParticipantTileProps): JSX.Element => {
  return (
    <div className="glass flex min-h-[120px] flex-col justify-between rounded-xl border border-white/10 p-3">
      <div className="flex items-center gap-3">
        <Avatar alt={participant.username} src={participant.avatarUrl} speaking={participant.speaking} size={44} />
        <div>
          <p className="font-ui text-sm text-white">{participant.username}</p>
          <p className="text-xs text-[#8A8D96]">{participant.isMuted ? "Muted" : "Live"}</p>
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-[#8A8D96]">
        <Volume2 size={14} />
        <input
          type="range"
          min={0}
          max={200}
          value={participant.volume}
          className="w-full accent-[#C9A84C]"
          onChange={(event) => onVolumeChange(participant.id, Number(event.target.value))}
        />
      </label>
    </div>
  );
};

export default ParticipantTile;

