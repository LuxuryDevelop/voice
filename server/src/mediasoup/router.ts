import * as mediasoup from "mediasoup";
import { getOrCreateWorker } from "./worker.js";

const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {
      "x-google-start-bitrate": 1200
    }
  },
  {
    kind: "video",
    mimeType: "video/VP9",
    clockRate: 90000,
    parameters: {
      profileId: 2
    }
  }
];

let routerPromise: Promise<mediasoup.types.Router> | null = null;

export const getOrCreateRouter = async (): Promise<mediasoup.types.Router> => {
  if (!routerPromise) {
    routerPromise = (async () => {
      const worker = await getOrCreateWorker();
      return worker.createRouter({ mediaCodecs });
    })();
  }
  return routerPromise;
};

