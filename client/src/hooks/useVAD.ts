import { useEffect, useRef, useState } from "react";

export const useVAD = (stream: MediaStream | null, threshold = 0.04): boolean => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) {
      setIsSpeaking(false);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, value) => sum + value, 0) / data.length / 255;
      setIsSpeaking(avg > threshold);
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      source.disconnect();
      analyser.disconnect();
      audioContext.close().catch(() => undefined);
    };
  }, [stream, threshold]);

  return isSpeaking;
};

