type AvatarProps = {
  src?: string | null;
  alt: string;
  speaking?: boolean;
  size?: number;
};

const Avatar = ({ src, alt, speaking = false, size = 40 }: AvatarProps): JSX.Element => {
  return (
    <div
      className={`rounded-full border border-white/20 ${speaking ? "voice-pulsing border-[#C9A84C]" : ""}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#111319] font-ui text-xs text-[#8A8D96]">
          {alt.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default Avatar;

