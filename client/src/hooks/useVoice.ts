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

const peerConnections = new Map<string, RTCPeerConnection>();
const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
let engineInitialized = false;

const iceServers: RTCIceServer[] = [
  { urls: "stun:stun.cloudflare.com:3478" },
  { urls: "stun:stun.l.google.com:19302" }
];

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

const closePeer = (remoteSocketId: string, setRemoteStream: (participantId: string, stream: MediaStream | null) => void): void => {
  const peer = peerConnections.get(remoteSocketId);
  if (peer) {
    peer.close();
    peerConnections.delete(remoteSocketId);
  }
  pendingCandidates.delete(remoteSocketId);
  setRemoteStream(remoteSocketId, null);
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
    participants,
    setRoomId,
    setMuted,
    setVideoEnabled,
    setPushToTalk,
    setConnected,
    setParticipants,
    setLocalStream,
    setRemoteStream,
    setSelfSocketId,
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

  const flushPendingCandidates = useCallback(async (remoteSocketId: string) => {
    const peer = peerConnections.get(remoteSocketId);
    const queue = pendingCandidates.get(remoteSocketId);
    if (!peer || !queue || queue.length === 0) {
      return;
    }
    for (const candidate of queue) {
      try {
        await peer.addIceCandidate(candidate);
      } catch {
        // Ignore malformed/out-of-order candidate.
      }
    }
    pendingCandidates.delete(remoteSocketId);
  }, []);

  const createPeerConnection = useCallback(
    async (remoteSocketId: string, shouldInitiate: boolean) => {
      const existing = peerConnections.get(remoteSocketId);
      if (existing) {
        return existing;
      }

      const peer = new RTCPeerConnection({ iceServers });
      peerConnections.set(remoteSocketId, peer);

      const stream = useVoiceStore.getState().localStream;
      stream?.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }
        socket.emit("voice:webrtc-ice", {
          to: remoteSocketId,
          candidate: event.candidate.toJSON()
        });
      };

      peer.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          setRemoteStream(remoteSocketId, remoteStream);
        }
      };

      peer.onconnectionstatechange = () => {
        if (["closed", "failed", "disconnected"].includes(peer.connectionState)) {
          closePeer(remoteSocketId, setRemoteStream);
        }
      };

      if (shouldInitiate) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("voice:webrtc-offer", {
          to: remoteSocketId,
          sdp: offer
        });
      }

      await flushPendingCandidates(remoteSocketId);
      return peer;
    },
    [flushPendingCandidates, setRemoteStream, socket]
  );

  useEffect(() => {
    if (engineInitialized) {
      return;
    }
    engineInitialized = true;

    const onConnect = () => {
      setSelfSocketId(socket.id);
    };
    if (socket.connected) {
      setSelfSocketId(socket.id);
    }
    socket.on("connect", onConnect);

    const onParticipants = async (payload: { roomId: string; participants: VoiceServerParticipant[] }) => {
      setParticipants(
        payload.participants.map((participant) => ({
          id: participant.socketId,
          userId: participant.userId,
          username: participant.username,
          isMuted: participant.isMuted,
          isVideoEnabled: participant.isVideoEnabled,
          isScreenSharing: false,
          volume: 100,
          speaking: participant.speaking
        }))
      );

      const selfSocketId = socket.id;
      const peersInRoom = payload.participants.map((participant) => participant.socketId);
      for (const remoteSocketId of peersInRoom) {
        if (remoteSocketId === selfSocketId) {
          continue;
        }
        if (!peerConnections.has(remoteSocketId)) {
          // Deterministic initiator to avoid glare.
          const shouldInitiate = selfSocketId > remoteSocketId;
          await createPeerConnection(remoteSocketId, shouldInitiate);
        }
      }

      for (const existingSocketId of [...peerConnections.keys()]) {
        if (!peersInRoom.includes(existingSocketId)) {
          closePeer(existingSocketId, setRemoteStream);
        }
      }
    };

    const onOffer = async (payload: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const peer = await createPeerConnection(payload.from, false);
      await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("voice:webrtc-answer", {
        to: payload.from,
        sdp: answer
      });
      await flushPendingCandidates(payload.from);
    };

    const onAnswer = async (payload: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const peer = peerConnections.get(payload.from);
      if (!peer) {
        return;
      }
      await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      await flushPendingCandidates(payload.from);
    };

    const onIce = async (payload: { from: string; candidate: RTCIceCandidateInit }) => {
      const peer = peerConnections.get(payload.from);
      if (!peer) {
        const queue = pendingCandidates.get(payload.from) ?? [];
        queue.push(payload.candidate);
        pendingCandidates.set(payload.from, queue);
        return;
      }
      try {
        await peer.addIceCandidate(payload.candidate);
      } catch {
        const queue = pendingCandidates.get(payload.from) ?? [];
        queue.push(payload.candidate);
        pendingCandidates.set(payload.from, queue);
      }
    };

    socket.on("voice:participants", onParticipants);
    socket.on("voice:webrtc-offer", onOffer);
    socket.on("voice:webrtc-answer", onAnswer);
    socket.on("voice:webrtc-ice", onIce);
  }, [createPeerConnection, flushPendingCandidates, setParticipants, setRemoteStream, setSelfSocketId, socket]);

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
        const selfSocketId = useVoiceStore.getState().selfSocketId;
        if (selfSocketId) {
          setParticipantSpeaking(selfSocketId, speaking);
        }
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
        const nextMuted = !useVoiceStore.getState().isMuted;
        setMuted(nextMuted);
        localStream?.getAudioTracks().forEach((track) => {
          track.enabled = !nextMuted;
        });
        emitVoiceState({ muted: nextMuted });
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
  }, [emitVoiceState, isPushToTalk, localStream, setMuted]);

  const joinVoiceRoom = useCallback(
    async (nextRoomId: string) => {
      try {
        if (useVoiceStore.getState().roomId === nextRoomId && useVoiceStore.getState().isConnected) {
          return;
        }
        setError(null);
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Microphone is unavailable in this context. Open app over HTTPS.");
        }

        let stream = useVoiceStore.getState().localStream;
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
    [emitVoiceState, setConnected, setError, setLocalStream, setMuted, setRoomId, socket, user?.id, user?.username]
  );

  const leaveVoiceRoom = useCallback(() => {
    if (roomId) {
      socket.emit("voice:leave", { roomId });
    }
    for (const remoteSocketId of [...peerConnections.keys()]) {
      closePeer(remoteSocketId, setRemoteStream);
    }
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRoomId(null);
    setConnected(false);
    setMuted(false);
    setParticipants([]);
  }, [localStream, roomId, setConnected, setLocalStream, setMuted, setParticipants, setRemoteStream, setRoomId, socket]);

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
    participants,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMute,
    toggleVideo,
    togglePushToTalk
  };
};
