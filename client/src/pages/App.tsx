import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import MainContent from "../components/layout/MainContent";
import StatusBar from "../components/layout/StatusBar";
import { useRoomsStore, type Room } from "../store/rooms";
import { useVoiceStore } from "../store/voice";
import { useAuthStore } from "../store/auth";
import { apiRequest } from "../lib/api";
import Button from "../components/ui/Button";

type RoomsResponse = {
  rooms: Array<{
    id: string;
    name: string;
    createdBy: string;
    createdAt: number;
    channels: Array<{ id: string; roomId: string; type: "text" | "voice"; name: string; createdAt: number }>;
  }>;
};

type UsersResponse = {
  users: Array<{
    id: string;
    username: string;
    role: "admin" | "user";
    status: string;
    isBanned: boolean;
    bannedReason: string | null;
  }>;
};

const AppPage = (): JSX.Element => {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setRooms = useRoomsStore((state) => state.setRooms);
  const addRoom = useRoomsStore((state) => state.addRoom);
  const setActiveRoom = useRoomsStore((state) => state.setActiveRoom);
  const setActiveChannel = useRoomsStore((state) => state.setActiveChannel);
  const setParticipants = useVoiceStore((state) => state.setParticipants);
  const [users, setUsers] = useState<UsersResponse["users"]>([]);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    const response = await apiRequest<RoomsResponse>("/api/rooms");
    const mapped: Room[] = response.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      channels: room.channels.map((channel) => ({
        id: channel.id,
        roomId: channel.roomId,
        type: channel.type,
        name: channel.name
      }))
    }));
    setRooms(mapped);
    if (mapped.length > 0) {
      setActiveRoom(mapped[0].id);
      if (mapped[0].channels.length > 0) {
        setActiveChannel(mapped[0].channels[0].id);
      }
    }
  }, [setActiveChannel, setActiveRoom, setRooms]);

  const loadUsers = useCallback(async () => {
    if (user?.role !== "admin") {
      return;
    }
    const response = await apiRequest<UsersResponse>("/api/users");
    setUsers(response.users);
  }, [user?.role]);

  useEffect(() => {
    setParticipants([
      {
        id: "local",
        username: user?.username ?? "You",
        isMuted: false,
        isVideoEnabled: false,
        isScreenSharing: false,
        volume: 100,
        speaking: false
      }
    ]);
  }, [setParticipants, user?.username]);

  useEffect(() => {
    void (async () => {
      try {
        await loadRooms();
        await loadUsers();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load app data");
        clearSession();
      }
    })();
  }, [clearSession, loadRooms, loadUsers]);

  const createRoom = async (): Promise<void> => {
    const roomName = prompt("Room name");
    if (!roomName || roomName.trim().length < 2) {
      return;
    }
    try {
      const response = await apiRequest<{
        room: {
          id: string;
          name: string;
          channels: Array<{ id: string; roomId: string; type: "text" | "voice"; name: string }>;
        };
      }>("/api/rooms", {
        method: "POST",
        body: JSON.stringify({ name: roomName.trim() })
      });
      addRoom({
        id: response.room.id,
        name: response.room.name,
        channels: response.room.channels
      });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create room");
    }
  };

  const banToggle = async (targetId: string, isBanned: boolean): Promise<void> => {
    try {
      await apiRequest(`/api/users/${targetId}/${isBanned ? "unban" : "ban"}`, {
        method: "POST",
        body: JSON.stringify(isBanned ? {} : { reason: "Banned by admin" })
      });
      await loadUsers();
    } catch (banError) {
      setError(banError instanceof Error ? banError.message : "Ban action failed");
    }
  };

  const createInvite = async (): Promise<void> => {
    try {
      const response = await apiRequest<{ code: string }>("/api/users/invites", {
        method: "POST",
        body: JSON.stringify({ maxUses: 20 })
      });
      setInviteCode(response.code);
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Invite generation failed");
    }
  };

  return (
    <div className="flex h-screen min-h-screen flex-col">
      {error ? <div className="bg-red-500/20 px-4 py-2 text-sm text-red-200">{error}</div> : null}
      <div className="flex min-h-0 flex-1">
        <Sidebar onCreateRoom={() => void createRoom()} />
        <MainContent />
        {user?.role === "admin" ? (
          <aside className="glass hidden w-[320px] border-l border-white/10 p-3 xl:block">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-ui text-xs uppercase tracking-[0.14em] text-[#C9A84C]">Admin</h3>
              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => void createInvite()}>
                + Invite
              </Button>
            </div>
            {inviteCode ? (
              <p className="mb-3 rounded-lg border border-[#C9A84C]/50 bg-black/20 p-2 text-xs text-[#C9A84C]">
                New invite: {inviteCode}
              </p>
            ) : null}
            <div className="space-y-2">
              {users.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <p className="text-sm text-white">
                    {item.username}{" "}
                    <span className="text-[10px] uppercase text-[#8A8D96]">{item.role}</span>
                  </p>
                  <p className="text-xs text-[#8A8D96]">{item.isBanned ? "Banned" : "Active"}</p>
                  {user.id !== item.id ? (
                    <Button
                      variant="ghost"
                      className="mt-2 w-full text-xs"
                      onClick={() => void banToggle(item.id, item.isBanned)}
                    >
                      {item.isBanned ? "Unban user" : "Ban user"}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
      <StatusBar />
    </div>
  );
};

export default AppPage;

