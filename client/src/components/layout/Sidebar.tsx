import { motion } from "framer-motion";
import { Hash, Trash2, Volume2 } from "lucide-react";
import { type Channel, useRoomsStore } from "../../store/rooms";
import Button from "../ui/Button";

type SidebarProps = {
  onCreateRoom: () => void;
  onSelectChannel: (channel: Channel) => void;
  onDeleteRoom: (roomId: string) => void;
  canManageRooms: boolean;
};

const Sidebar = ({ onCreateRoom, onSelectChannel, onDeleteRoom, canManageRooms }: SidebarProps): JSX.Element => {
  const rooms = useRoomsStore((state) => state.rooms);
  const setActiveRoom = useRoomsStore((state) => state.setActiveRoom);
  const activeRoomId = useRoomsStore((state) => state.activeRoomId);

  return (
    <aside className="glass w-full max-w-[320px] border-r border-white/10 p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-ui text-sm uppercase tracking-[0.2em] text-[#C9A84C]">LuxuryVoice</h2>
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onCreateRoom}>
          + Room
        </Button>
      </div>
      <div className="space-y-3">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            layout
            whileHover={{ scale: 1.01 }}
            className={`glass rounded-xl border p-3 ${
              activeRoomId === room.id ? "border-[#C9A84C]/70" : "border-white/10"
            }`}
            onClick={() => setActiveRoom(room.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-ui text-sm text-white">{room.name}</p>
              {canManageRooms ? (
                <button
                  type="button"
                  className="rounded-md p-1 text-[#8A8D96] transition hover:bg-red-500/15 hover:text-red-300"
                  title="Delete room"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteRoom(room.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              ) : null}
            </div>
            <div className="mt-2 space-y-1">
              {room.channels.map((channel) => (
                <button
                  type="button"
                  key={channel.id}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs text-[#8A8D96] hover:bg-white/5 hover:text-white"
                  onClick={() => onSelectChannel(channel)}
                >
                  {channel.type === "text" ? <Hash size={14} /> : <Volume2 size={14} />}
                  {channel.name}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
