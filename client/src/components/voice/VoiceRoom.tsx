import ParticipantTile from "./ParticipantTile";
import VoiceControls from "./VoiceControls";
import ScreenShareView from "./ScreenShareView";
import { useVoiceStore } from "../../store/voice";
import { useScreenShare } from "../../hooks/useScreenShare";

const VoiceRoom = (): JSX.Element => {
  const participants = useVoiceStore((state) => state.participants);
  const setParticipantVolume = useVoiceStore((state) => state.setParticipantVolume);
  const { stream } = useScreenShare();

  return (
    <section className="border-b border-white/10 p-3">
      <VoiceControls />
      <ScreenShareView stream={stream} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {participants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-[#8A8D96]">
            Voice room is empty. Join a voice channel to start.
          </div>
        ) : (
          participants.map((participant) => (
            <ParticipantTile
              key={participant.id}
              participant={participant}
              onVolumeChange={setParticipantVolume}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default VoiceRoom;

