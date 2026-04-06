import { Server, Socket } from "socket.io";
import { randomUUID } from "node:crypto";

type ChatMessage = {
  id: string;
  channelId: string;
  authorId: string;
  author: string;
  content: string;
  createdAt: number;
};

const channelMessages = new Map<string, ChatMessage[]>();

const pushChannelMessage = (channelId: string, message: ChatMessage): void => {
  const existing = channelMessages.get(channelId) ?? [];
  existing.push(message);
  channelMessages.set(channelId, existing.slice(-200));
};

export const registerChatHandlers = (io: Server, socket: Socket): void => {
  socket.on("chat:join-channel", (channelId: string) => {
    socket.join(`channel:${channelId}`);
    socket.emit("chat:history", {
      channelId,
      messages: channelMessages.get(channelId) ?? []
    });
  });

  socket.on("chat:leave-channel", (channelId: string) => {
    socket.leave(`channel:${channelId}`);
  });

  socket.on("chat:send", (payload: { channelId: string; content: string; authorId?: string; author?: string }) => {
    const trimmed = payload.content.trim();
    if (!payload.channelId || !trimmed) {
      return;
    }

    const message: ChatMessage = {
      id: randomUUID(),
      channelId: payload.channelId,
      content: trimmed,
      authorId: payload.authorId ?? socket.id,
      author: payload.author ?? "guest",
      createdAt: Date.now()
    };

    pushChannelMessage(payload.channelId, message);
    io.to(`channel:${payload.channelId}`).emit("chat:new-message", message);
  });
};
