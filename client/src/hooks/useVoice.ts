import { useCallback } from "react";
import { useVoiceStore } from "../store/voice";
import { useSocket } from "./useSocket";

export const useVoice = () => {
  const { socket } = useSocket();
  const {
    roomId,
    isMuted,
    isVideoEnabled,
    isPushToTalk,
    setRoomId,
    setMuted,
    setVideoEnabled,
    setPushToTalk
  } = useVoiceStore();

  const joinVoiceRoom = useCallback(
    (nextRoomId: string) => {
      socket.emit("voice:join", nextRoomId);
      setRoomId(nextRoomId);
    },
    [setRoomId, socket]
  );

  const leaveVoiceRoom = useCallback(() => {
    if (!roomId) {
      return;
    }
    socket.emit("voice:leave", roomId);
    setRoomId(null);
  }, [roomId, setRoomId, socket]);

  return {
    roomId,
    isMuted,
    isVideoEnabled,
    isPushToTalk,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMute: () => setMuted(!isMuted),
    toggleVideo: () => setVideoEnabled(!isVideoEnabled),
    togglePushToTalk: () => setPushToTalk(!isPushToTalk)
  };
};

