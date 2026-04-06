import { Socket } from "socket.io";

export const registerVoiceHandlers = (socket: Socket): void => {
  socket.on("voice:join", (roomId: string) => {
    socket.join(`voice:${roomId}`);
    socket.to(`voice:${roomId}`).emit("voice:user-joined", { socketId: socket.id });
  });

  socket.on("voice:leave", (roomId: string) => {
    socket.leave(`voice:${roomId}`);
    socket.to(`voice:${roomId}`).emit("voice:user-left", { socketId: socket.id });
  });
};

