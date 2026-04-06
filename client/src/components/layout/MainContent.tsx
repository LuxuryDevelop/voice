import { AnimatePresence, motion } from "framer-motion";
import VoiceRoom from "../voice/VoiceRoom";
import MessageList from "../chat/MessageList";
import MessageInput from "../chat/MessageInput";
import { useRoomsStore } from "../../store/rooms";

const MainContent = (): JSX.Element => {
  const activeChannelId = useRoomsStore((state) => state.activeChannelId);

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <AnimatePresence mode="wait">
        <motion.section
          key={activeChannelId ?? "empty"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="glass flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10"
        >
          <VoiceRoom />
          <MessageList />
          <MessageInput />
        </motion.section>
      </AnimatePresence>
    </main>
  );
};

export default MainContent;

