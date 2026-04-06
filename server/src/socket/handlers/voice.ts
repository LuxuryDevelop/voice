import { Server, Socket } from "socket.io";

type VoiceParticipant = {
  socketId: string;
  userId: string;
  username: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  speaking: boolean;
};

const roomParticipants = new Map<string, Map<string, VoiceParticipant>>();
const socketToRoom = new Map<string, string>();

const emitParticipants = (io: Server, roomId: string): void => {
  const participantsMap = roomParticipants.get(roomId);
  const participants = participantsMap ? [...participantsMap.values()] : [];
  io.to(`voice:${roomId}`).emit("voice:participants", { roomId, participants });
};

const removeSocketFromRoom = (io: Server, socket: Socket): void => {
  const roomId = socketToRoom.get(socket.id);
  if (!roomId) {
    return;
  }

  socket.leave(`voice:${roomId}`);
  socketToRoom.delete(socket.id);
  const participants = roomParticipants.get(roomId);
  if (participants) {
    participants.delete(socket.id);
    if (participants.size === 0) {
      roomParticipants.delete(roomId);
    }
  }
  emitParticipants(io, roomId);
};

export const registerVoiceHandlers = (io: Server, socket: Socket): void => {
  socket.on("voice:join", (payload: { roomId: string; userId?: string; username?: string }) => {
    if (!payload.roomId) {
      return;
    }

    removeSocketFromRoom(io, socket);
    socket.join(`voice:${payload.roomId}`);
    socketToRoom.set(socket.id, payload.roomId);

    const participants = roomParticipants.get(payload.roomId) ?? new Map<string, VoiceParticipant>();
    participants.set(socket.id, {
      socketId: socket.id,
      userId: payload.userId ?? socket.id,
      username: payload.username ?? "guest",
      isMuted: false,
      isVideoEnabled: false,
      speaking: false
    });
    roomParticipants.set(payload.roomId, participants);

    emitParticipants(io, payload.roomId);
  });

  socket.on("voice:state", (payload: { isMuted?: boolean; isVideoEnabled?: boolean; speaking?: boolean }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) {
      return;
    }

    const participants = roomParticipants.get(roomId);
    const current = participants?.get(socket.id);
    if (!participants || !current) {
      return;
    }

    participants.set(socket.id, {
      ...current,
      isMuted: payload.isMuted ?? current.isMuted,
      isVideoEnabled: payload.isVideoEnabled ?? current.isVideoEnabled,
      speaking: payload.speaking ?? current.speaking
    });
    emitParticipants(io, roomId);
  });

  socket.on("voice:leave", (_payload?: { roomId?: string }) => {
    removeSocketFromRoom(io, socket);
  });

  socket.on("disconnect", () => {
    removeSocketFromRoom(io, socket);
  });
};
