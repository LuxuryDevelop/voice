import { KeyboardEvent, useMemo, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import ReactMarkdown from "react-markdown";
import Button from "../ui/Button";
import { useRoomsStore } from "../../store/rooms";
import { useSocket } from "../../hooks/useSocket";
import { useAuthStore } from "../../store/auth";

const MessageInput = (): JSX.Element => {
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);
  const rooms = useRoomsStore((state) => state.rooms);
  const activeChannelId = useRoomsStore((state) => state.activeChannelId);
  const activeChannel = rooms.flatMap((room) => room.channels).find((channel) => channel.id === activeChannelId);

  const [value, setValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const preview = useMemo(() => value.trim(), [value]);
  const disabled = !activeChannelId || activeChannel?.type !== "text";

  const send = (): void => {
    const content = value.trim();
    if (!activeChannelId || !content || !user) {
      return;
    }
    socket.emit("chat:send", {
      channelId: activeChannelId,
      content,
      authorId: user.id,
      author: user.username
    });
    setValue("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  if (disabled) {
    return (
      <div className="border-t border-white/10 p-3 text-xs text-[#8A8D96]">
        Chat input is available only inside text channels.
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 p-3">
      <div className="mb-2 flex items-start gap-2">
        <textarea
          rows={3}
          value={value}
          onKeyDown={onKeyDown}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Write message (Markdown enabled). Enter sends, Shift+Enter new line."
          className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#2D9CDB]"
        />
        <Button variant="ghost" type="button" onClick={() => setShowEmoji((prev) => !prev)}>
          🙂
        </Button>
      </div>

      {showEmoji ? (
        <div className="mb-2">
          <EmojiPicker
            onEmojiClick={(emojiData) => setValue((prev) => `${prev}${emojiData.emoji}`)}
            skinTonesDisabled
            lazyLoadEmojis
            width="100%"
            height={320}
            previewConfig={{ showPreview: false }}
          />
        </div>
      ) : null}

      {preview ? (
        <div className="mb-2 rounded-xl border border-white/10 bg-black/20 p-2">
          <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-[#8A8D96]">Preview</p>
          <div className="prose prose-invert max-w-none text-sm">
            <ReactMarkdown>{preview}</ReactMarkdown>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <label className="cursor-pointer text-xs text-[#8A8D96] hover:text-white">
          Attach file
          <input className="hidden" type="file" />
        </label>
        <Button type="button" onClick={send}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;

