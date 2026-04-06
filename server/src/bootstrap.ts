import argon2 from "argon2";
import { config } from "./config.js";
import {
  countUsers,
  createRoomWithDefaultChannels,
  createUser,
  ensureInviteExists,
  findUserByUsername,
  listRoomsWithChannels
} from "./db/queries.js";

export const bootstrapData = async (): Promise<void> => {
  const totalUsers = countUsers();

  if (totalUsers === 0) {
    const adminPasswordHash = await argon2.hash(config.ADMIN_PASSWORD);
    createUser({
      username: config.ADMIN_USERNAME,
      passwordHash: adminPasswordHash,
      role: "admin"
    });
    // eslint-disable-next-line no-console
    console.log(
      `Bootstrap admin created. username="${config.ADMIN_USERNAME}" password="${config.ADMIN_PASSWORD}" (change in .env)`
    );
  }

  const admin = findUserByUsername(config.ADMIN_USERNAME);
  ensureInviteExists(config.BOOTSTRAP_INVITE_CODE, admin?.id);

  if (listRoomsWithChannels().length === 0) {
    if (admin) {
      createRoomWithDefaultChannels({
        name: "MainLounge",
        createdBy: admin.id
      });
    }
  }
};
