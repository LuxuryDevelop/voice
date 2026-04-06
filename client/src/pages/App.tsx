import { useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import MainContent from "../components/layout/MainContent";
import StatusBar from "../components/layout/StatusBar";
import { useRoomsStore } from "../store/rooms";
import { useVoiceStore } from "../store/voice";

const AppPage = (): JSX.Element => {
  const setRooms = useRoomsStore((state) => state.setRooms);
  const setParticipants = useVoiceStore((state) => state.setParticipants);

  useEffect(() => {
    setRooms([
      {
        id: "room-main",
        name: "Main Lounge",
        channels: [
          { id: "text-general", roomId: "room-main", type: "text", name: "general" },
          { id: "voice-pitlane", roomId: "room-main", type: "voice", name: "pitlane" }
        ]
      }
    ]);

    setParticipants([
      {
        id: "local",
        username: "You",
        isMuted: false,
        isVideoEnabled: false,
        isScreenSharing: false,
        volume: 100,
        speaking: false
      }
    ]);
  }, [setParticipants, setRooms]);

  return (
    <div className="flex h-screen min-h-screen flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <MainContent />
      </div>
      <StatusBar />
    </div>
  );
};

export default AppPage;

