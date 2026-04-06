import * as mediasoup from "mediasoup";
import { config } from "../config.js";

let workerPromise: Promise<mediasoup.types.Worker> | null = null;

export const getOrCreateWorker = (): Promise<mediasoup.types.Worker> => {
  if (!workerPromise) {
    workerPromise = mediasoup.createWorker({
      rtcMinPort: config.MEDIASOUP_MIN_PORT,
      rtcMaxPort: config.MEDIASOUP_MAX_PORT,
      logLevel: "warn",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"]
    });
  }
  return workerPromise;
};

