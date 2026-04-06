import { Device } from "mediasoup-client";

let device: Device | null = null;

export const getMediasoupDevice = async (): Promise<Device> => {
  if (device) {
    return device;
  }

  device = new Device();
  return device;
};

