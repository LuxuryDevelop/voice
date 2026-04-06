import { useEffect, useRef } from "react";
import Message from "./Message";
import { useRoomsStore } from "../../store/rooms";
import { useChatStore, type ChatMessage } from "../../store/chat";
import { useSocket } from "../../hooks/useSocket";

const MessageList = (): JSX.Element => {
  const { socket } = useSocket();
  const rooms = useRoomsStore((state) => state.rooms);
  const activeChannelId = useRoomsStore((state) => state.activeChannelId);
  const activeChannel = rooms.flatMap((room) => room.channels).find((channel) => channel.id === activeChannelId);
  const messages = useChatStore((state) => (activeChannelId ? state.messagesByChannel[activeChannelId] ?? [] : []));
  const setHistory = useChatStore((state) => state.setHistory);
  const addMessage = useChatStore((state) => state.addMessage);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeChannelId || activeChannel?.type !== "text") {
      return;
    }
    socket.emit("chat:join-channel", activeChannelId);
    return () => {
      socket.emit("chat:leave-channel", activeChannelId);
    };
  }, [activeChannel?.type, activeChannelId, socket]);

  useEffect(() => {
    const onHistory = (payload: { channelId: string; messages: ChatMessage[] }) => {
      setHistory(payload.channelId, payload.messages);
    };
    const onNewMessage = (message: ChatMessage) => {
      addMessage(message);
    };

    socket.on("chat:history", onHistory);
    socket.on("chat:new-message", onNewMessage);
    return () => {
      socket.off("chat:history", onHistory);
      socket.off("chat:new-message", onNewMessage);
    };
  }, [addMessage, setHistory, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeChannel || activeChannel.type !== "text") {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-sm text-[#8A8D96]">
        Select a text channel to open chat.
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto px-3 py-2">
      <div className="space-y-2">
        {messages.map((message) => (
          <Message key={message.id} author={message.author} content={message.content} createdAt={message.createdAt} />
        ))}
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-sm text-[#8A8D96]">
            No messages yet. Write first message below.
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;

