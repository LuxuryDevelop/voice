import { motion } from "framer-motion";
import { Hash, Volume2 } from "lucide-react";
import { useRoomsStore } from "../../store/rooms";

const Sidebar = (): JSX.Element => {
  const rooms = useRoomsStore((state) => state.rooms);
  const setActiveRoom = useRoomsStore((state) => state.setActiveRoom);
  const setActiveChannel = useRoomsStore((state) => state.setActiveChannel);

  return (
    <aside className="glass w-full max-w-[320px] border-r border-white/10 p-4">
      <h2 className="mb-4 font-ui text-sm uppercase tracking-[0.2em] text-[#C9A84C]">LuxuryVoice</h2>
      <div className="space-y-3">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            layout
            whileHover={{ scale: 1.01 }}
            className="glass rounded-xl border border-white/10 p-3"
            onClick={() => setActiveRoom(room.id)}
          >
            <p className="font-ui text-sm text-white">{room.name}</p>
            <div className="mt-2 space-y-1">
              {room.channels.map((channel) => (
                <button
                  type="button"
                  key={channel.id}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs text-[#8A8D96] hover:bg-white/5 hover:text-white"
                  onClick={() => setActiveChannel(channel.id)}
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

