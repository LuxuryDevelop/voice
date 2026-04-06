import { useCallback, useEffect } from "react";
import { useVoiceStore } from "../store/voice";
import { useSocket } from "./useSocket";
import { useAuthStore } from "../store/auth";

type VoiceServerParticipant = {
  socketId: string;
  userId: string;
  username: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  speaking: boolean;
};

const createAudioStream = async (): Promise<MediaStream> => {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: false
  });
};

export const useVoice = () => {
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);
  const {
    roomId,
    isMuted,
    isVideoEnabled,
    isPushToTalk,
    isConnected,
    localStream,
    error,
    setRoomId,
    setMuted,
    setVideoEnabled,
    setPushToTalk,
    setConnected,
    setParticipants,
    setLocalStream,
    setParticipantSpeaking,
    setError
  } = useVoiceStore();

  const emitVoiceState = useCallback(
    (next: { muted?: boolean; video?: boolean; speaking?: boolean }) => {
      socket.emit("voice:state", {
        isMuted: next.muted ?? isMuted,
        isVideoEnabled: next.video ?? isVideoEnabled,
        speaking: next.speaking ?? false
      });
    },
    [isMuted, isVideoEnabled, socket]
  );

  useEffect(() => {
    const onParticipants = (payload: { roomId: string; participants: VoiceServerParticipant[] }) => {
      setParticipants(
        payload.participants.map((participant) => ({
          id: participant.userId,
          username: participant.username,
          isMuted: participant.isMuted,
          isVideoEnabled: participant.isVideoEnabled,
          isScreenSharing: false,
          volume: 100,
          speaking: participant.speaking
        }))
      );
    };

    socket.on("voice:participants", onParticipants);
    return () => {
      socket.off("voice:participants", onParticipants);
    };
  }, [setParticipants, socket]);

  useEffect(() => {
    if (!localStream || !roomId) {
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(localStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    let raf = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, value) => sum + value, 0) / data.length / 255;
      const speaking = avg > 0.05 && !isMuted;
      if (user?.id) {
        setParticipantSpeaking(user.id, speaking);
      }
      emitVoiceState({ speaking });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close();
    };
  }, [emitVoiceState, isMuted, localStream, roomId, setParticipantSpeaking, user?.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "m") {
        setMuted(!isMuted);
        localStream?.getAudioTracks().forEach((track) => {
          track.enabled = isMuted;
        });
        emitVoiceState({ muted: !isMuted });
      }

      if (isPushToTalk && event.code === "Space") {
        localStream?.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
        setMuted(false);
        emitVoiceState({ muted: false });
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isPushToTalk && event.code === "Space") {
        localStream?.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
        setMuted(true);
        emitVoiceState({ muted: true });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [emitVoiceState, isMuted, isPushToTalk, localStream, setMuted]);

  const joinVoiceRoom = useCallback(
    async (nextRoomId: string) => {
      try {
        setError(null);
        let stream = localStream;
        if (!stream) {
          stream = await createAudioStream();
          setLocalStream(stream);
        }
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });

        socket.emit("voice:join", {
          roomId: nextRoomId,
          userId: user?.id,
          username: user?.username
        });
        setRoomId(nextRoomId);
        setConnected(true);
        setMuted(false);
        emitVoiceState({ muted: false });
      } catch (joinError) {
        setError(joinError instanceof Error ? joinError.message : "Cannot access microphone");
      }
    },
    [emitVoiceState, localStream, setConnected, setError, setLocalStream, setMuted, setRoomId, socket, user?.id, user?.username]
  );

  const leaveVoiceRoom = useCallback(() => {
    if (roomId) {
      socket.emit("voice:leave", { roomId });
    }
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRoomId(null);
    setConnected(false);
    setMuted(false);
    setParticipants([]);
  }, [localStream, roomId, setConnected, setLocalStream, setMuted, setParticipants, setRoomId, socket]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setMuted(nextMuted);
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    emitVoiceState({ muted: nextMuted });
  }, [emitVoiceState, isMuted, localStream, setMuted]);

  const toggleVideo = useCallback(() => {
    const nextEnabled = !isVideoEnabled;
    setVideoEnabled(nextEnabled);
    emitVoiceState({ video: nextEnabled });
  }, [emitVoiceState, isVideoEnabled, setVideoEnabled]);

  const togglePushToTalk = useCallback(() => {
    const next = !isPushToTalk;
    setPushToTalk(next);
    if (next) {
      localStream?.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
      setMuted(true);
      emitVoiceState({ muted: true });
    }
  }, [emitVoiceState, isPushToTalk, localStream, setMuted, setPushToTalk]);

  return {
    roomId,
    isMuted,
    isVideoEnabled,
    isPushToTalk,
    isConnected,
    error,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMute,
    toggleVideo,
    togglePushToTalk
  };
};

