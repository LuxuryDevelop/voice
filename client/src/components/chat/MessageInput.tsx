import { useMemo, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import ReactMarkdown from "react-markdown";
import Button from "../ui/Button";

const MessageInput = (): JSX.Element => {
  const [value, setValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const preview = useMemo(() => value.trim(), [value]);

  return (
    <div className="border-t border-white/10 p-3">
      <div className="mb-2 flex items-start gap-2">
        <textarea
          rows={3}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Write message (Markdown enabled)"
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
        <Button type="button">Send</Button>
      </div>
    </div>
  );
};

export default MessageInput;

