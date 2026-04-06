import { Server } from "socket.io";
import { registerChatHandlers } from "./handlers/chat.js";
import { registerPresenceHandlers } from "./handlers/presence.js";
import { registerVoiceHandlers } from "./handlers/voice.js";

export const registerSocketServer = (io: Server): void => {
  io.on("connection", (socket) => {
    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerVoiceHandlers(io, socket);
  });
};
