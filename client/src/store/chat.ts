import { create } from "zustand";

export type ChatMessage = {
  id: string;
  channelId: string;
  authorId: string;
  author: string;
  content: string;
  createdAt: number;
};

type ChatState = {
  messagesByChannel: Record<string, ChatMessage[]>;
  setHistory: (channelId: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messagesByChannel: {},
  setHistory: (channelId, messages) =>
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: messages
      }
    })),
  addMessage: (message) =>
    set((state) => {
      const existing = state.messagesByChannel[message.channelId] ?? [];
      return {
        messagesByChannel: {
          ...state.messagesByChannel,
          [message.channelId]: [...existing, message].slice(-300)
        }
      };
    })
}));

