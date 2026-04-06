import { create } from "zustand";

export type Participant = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  volume: number;
  speaking: boolean;
};

type VoiceState = {
  roomId: string | null;
  callStartedAt: number | null;
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isPushToTalk: boolean;
  localStream: MediaStream | null;
  error: string | null;
  participants: Participant[];
  setRoomId: (roomId: string | null) => void;
  setConnected: (connected: boolean) => void;
  setMuted: (muted: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setPushToTalk: (enabled: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setError: (error: string | null) => void;
  setParticipants: (participants: Participant[]) => void;
  setParticipantVolume: (participantId: string, volume: number) => void;
  setParticipantSpeaking: (participantId: string, speaking: boolean) => void;
  reset: () => void;
};

export const useVoiceStore = create<VoiceState>((set) => ({
  roomId: null,
  callStartedAt: null,
  isConnected: false,
  isMuted: false,
  isVideoEnabled: false,
  isPushToTalk: false,
  localStream: null,
  error: null,
  participants: [],
  setRoomId: (roomId) => set({ roomId, callStartedAt: roomId ? Date.now() : null }),
  setConnected: (isConnected) => set({ isConnected }),
  setMuted: (isMuted) => set({ isMuted }),
  setVideoEnabled: (isVideoEnabled) => set({ isVideoEnabled }),
  setPushToTalk: (isPushToTalk) => set({ isPushToTalk }),
  setLocalStream: (localStream) => set({ localStream }),
  setError: (error) => set({ error }),
  setParticipants: (participants) => set({ participants }),
  setParticipantVolume: (participantId, volume) =>
    set((state) => ({
      participants: state.participants.map((participant) =>
        participant.id === participantId ? { ...participant, volume } : participant
      )
    })),
  setParticipantSpeaking: (participantId, speaking) =>
    set((state) => ({
      participants: state.participants.map((participant) =>
        participant.id === participantId ? { ...participant, speaking } : participant
      )
    })),
  reset: () =>
    set({
      roomId: null,
      callStartedAt: null,
      isConnected: false,
      isMuted: false,
      isVideoEnabled: false,
      isPushToTalk: false,
      localStream: null,
      error: null,
      participants: []
    })
}));
