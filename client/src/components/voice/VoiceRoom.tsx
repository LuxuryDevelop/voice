import ParticipantTile from "./ParticipantTile";
import VoiceControls from "./VoiceControls";
import ScreenShareView from "./ScreenShareView";
import { useVoiceStore } from "../../store/voice";
import { useScreenShare } from "../../hooks/useScreenShare";
import { useVoice } from "../../hooks/useVoice";
import Button from "../ui/Button";
import { useRoomsStore } from "../../store/rooms";

const VoiceRoom = (): JSX.Element => {
  const rooms = useRoomsStore((state) => state.rooms);
  const activeChannelId = useRoomsStore((state) => state.activeChannelId);
  const activeChannel = rooms.flatMap((room) => room.channels).find((channel) => channel.id === activeChannelId);

  const participants = useVoiceStore((state) => state.participants);
  const setParticipantVolume = useVoiceStore((state) => state.setParticipantVolume);
  const { stream } = useScreenShare();
  const { roomId, isConnected, error, joinVoiceRoom, leaveVoiceRoom } = useVoice();

  if (!activeChannel || activeChannel.type !== "voice") {
    return (
      <section className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-[#8A8D96]">
          Select a voice channel in the sidebar to start speaking.
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-0 flex-1 border-b border-white/10 p-3">
      <VoiceControls />
      <div className="mb-3 flex items-center gap-2">
        {!isConnected || roomId !== activeChannel.id ? (
          <Button type="button" onClick={() => void joinVoiceRoom(activeChannel.id)}>
            Join Voice Channel
          </Button>
        ) : (
          <Button variant="ghost" type="button" onClick={leaveVoiceRoom}>
            Leave Voice Channel
          </Button>
        )}
        <p className="text-xs text-[#8A8D96]">
          Channel: {activeChannel.name}. Click Join, allow microphone access, then talk.
        </p>
      </div>
      {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}
      <ScreenShareView stream={stream} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {participants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-[#8A8D96]">
            Nobody in this voice channel yet.
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

