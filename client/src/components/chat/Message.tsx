import ReactMarkdown from "react-markdown";

type MessageProps = {
  author: string;
  content: string;
  createdAt: number;
};

const Message = ({ author, content, createdAt }: MessageProps): JSX.Element => {
  return (
    <article className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-ui text-xs text-[#C9A84C]">{author}</p>
        <time className="text-[11px] text-[#8A8D96]">{new Date(createdAt).toLocaleTimeString()}</time>
      </div>
      <div className="prose prose-invert max-w-none text-sm">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </article>
  );
};

export default Message;

