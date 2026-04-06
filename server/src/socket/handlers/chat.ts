import { Server, Socket } from "socket.io";

export const registerChatHandlers = (io: Server, socket: Socket): void => {
  socket.on("chat:join-channel", (channelId: string) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on("chat:leave-channel", (channelId: string) => {
    socket.leave(`channel:${channelId}`);
  });

  socket.on("chat:send", (payload: { channelId: string; content: string }) => {
    io.to(`channel:${payload.channelId}`).emit("chat:new-message", {
      id: crypto.randomUUID(),
      channelId: payload.channelId,
      content: payload.content,
      createdAt: Date.now()
    });
  });
};

