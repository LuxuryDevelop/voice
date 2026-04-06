import { Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff } from "lucide-react";
import { useVoice } from "../../hooks/useVoice";
import Button from "../ui/Button";
import { useVoiceStore } from "../../store/voice";

const formatDuration = (startedAt: number | null): string => {
  if (!startedAt) {
    return "00:00";
  }
  const total = Math.floor((Date.now() - startedAt) / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

const StatusBar = (): JSX.Element => {
  const { roomId, isMuted, isVideoEnabled, toggleMute, toggleVideo, leaveVoiceRoom } = useVoice();
  const callStartedAt = useVoiceStore((state) => state.callStartedAt);

  return (
    <footer className="glass m-3 mt-0 flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
      <div className="font-ui text-xs text-[#8A8D96]">
        <p>Room: {roomId ?? "No active room"}</p>
        <p>Call time: {formatDuration(callStartedAt)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={toggleMute}>
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </Button>
        <Button variant="ghost" onClick={toggleVideo}>
          {isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
        </Button>
        <Button variant="ghost">
          <MonitorUp size={16} />
        </Button>
        <Button variant="ghost" onClick={leaveVoiceRoom}>
          <PhoneOff size={16} />
        </Button>
      </div>
    </footer>
  );
};

export default StatusBar;

