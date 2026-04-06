import { useCallback, useState } from "react";

export const useScreenShare = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const start = useCallback(async () => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari && typeof navigator.mediaDevices?.getDisplayMedia !== "function") {
      throw new Error("Safari screen share is not supported in this environment.");
    }

    const media = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    setStream(media);
    return media;
  }, []);

  const stop = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }, [stream]);

  return {
    stream,
    isSharing: Boolean(stream),
    startScreenShare: start,
    stopScreenShare: stop
  };
};

