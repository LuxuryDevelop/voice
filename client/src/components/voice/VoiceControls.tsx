import Button from "../ui/Button";
import { useVoice } from "../../hooks/useVoice";

const VoiceControls = (): JSX.Element => {
  const { isPushToTalk, togglePushToTalk, isConnected } = useVoice();

  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-2">
      <p className="font-ui text-xs text-[#8A8D96]">
        Voice: {isConnected ? "Connected" : "Disconnected"} | Hotkeys: `M` mute, `Space` push-to-talk
      </p>
      <Button variant="ghost" onClick={togglePushToTalk}>
        {isPushToTalk ? "Push-to-Talk: ON" : "Push-to-Talk: OFF"}
      </Button>
    </div>
  );
};

export default VoiceControls;
