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
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  setActiveRoom: (roomId: string | null) => void;
  setActiveChannel: (channelId: string | null) => void;
};

export const useRoomsStore = create<RoomsState>((set) => ({
  rooms: [],
  activeRoomId: null,
  activeChannelId: null,
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) =>
    set((state) => ({
      rooms: [...state.rooms, room]
    })),
  removeRoom: (roomId) =>
    set((state) => {
      const removedRoom = state.rooms.find((room) => room.id === roomId);
      const removedChannelIds = new Set((removedRoom?.channels ?? []).map((channel) => channel.id));
      return {
        rooms: state.rooms.filter((room) => room.id !== roomId),
        activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId,
        activeChannelId: removedChannelIds.has(state.activeChannelId ?? "") ? null : state.activeChannelId
      };
    }),
  setActiveRoom: (activeRoomId) => set({ activeRoomId }),
  setActiveChannel: (activeChannelId) => set({ activeChannelId })
}));
