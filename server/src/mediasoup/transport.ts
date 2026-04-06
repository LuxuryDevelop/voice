import * as mediasoup from "mediasoup";
import { config } from "../config.js";

export const createWebRtcTransport = async (
  router: mediasoup.types.Router
): Promise<mediasoup.types.WebRtcTransport> => {
  return router.createWebRtcTransport({
    listenInfos: [
      {
        protocol: "udp",
        ip: config.MEDIASOUP_LISTEN_IP,
        announcedAddress: config.MEDIASOUP_ANNOUNCED_IP || undefined
      },
      {
        protocol: "tcp",
        ip: config.MEDIASOUP_LISTEN_IP,
        announcedAddress: config.MEDIASOUP_ANNOUNCED_IP || undefined
      }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true
  });
};

