import { Server, Socket } from "socket.io";

const onlineUsers = new Map<string, { socketId: string; status: "online" | "away" | "dnd" }>();

export const registerPresenceHandlers = (io: Server, socket: Socket): void => {
  socket.on("presence:set", (payload: { userId: string; status: "online" | "away" | "dnd" }) => {
    onlineUsers.set(payload.userId, { socketId: socket.id, status: payload.status });
    io.emit("presence:updated", payload);
  });

  socket.on("disconnect", () => {
    const user = [...onlineUsers.entries()].find(([, data]) => data.socketId === socket.id);
    if (!user) {
      return;
    }

    const [userId] = user;
    onlineUsers.delete(userId);
    io.emit("presence:updated", { userId, status: "offline" });
  });
};

export const listOnlineUsers = (): Array<{ userId: string; status: "online" | "away" | "dnd" }> => {
  return [...onlineUsers.entries()].map(([userId, data]) => ({
    userId,
    status: data.status
  }));
};

