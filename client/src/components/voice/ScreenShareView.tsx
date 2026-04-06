type ScreenShareViewProps = {
  stream: MediaStream | null;
};

const ScreenShareView = ({ stream }: ScreenShareViewProps): JSX.Element | null => {
  if (!stream) {
    return null;
  }

  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-[#2D9CDB]/50">
      <video
        autoPlay
        playsInline
        muted
        ref={(element) => {
          if (element && element.srcObject !== stream) {
            element.srcObject = stream;
          }
        }}
        className="max-h-[240px] w-full object-cover"
      />
    </div>
  );
};

export default ScreenShareView;

