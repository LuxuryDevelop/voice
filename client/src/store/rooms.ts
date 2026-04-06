import { create } from "zustand";

export type Channel = {
  id: string;
  roomId: string;
  type: "text" | "voice";
  name: string;
};

export type Room = {
  id: string;
  name: string;
  channels: Channel[];
};

type RoomsState = {
  rooms: Room[];
  activeRoomId: string | null;
  activeChannelId: string | null;
  setRooms: (rooms: Room[]) => void;
  setActiveRoom: (roomId: string | null) => void;
  setActiveChannel: (channelId: string | null) => void;
};

export const useRoomsStore = create<RoomsState>((set) => ({
  rooms: [],
  activeRoomId: null,
  activeChannelId: null,
  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (activeRoomId) => set({ activeRoomId }),
  setActiveChannel: (activeChannelId) => set({ activeChannelId })
}));

