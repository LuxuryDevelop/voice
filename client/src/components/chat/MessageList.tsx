import { useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Message from "./Message";

const MessageList = (): JSX.Element => {
  const messages = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: `msg-${index}`,
        author: index % 2 === 0 ? "you" : "teammate",
        content: index % 4 === 0 ? "**Luxury** ping in `#general`" : "Hello from the channel.",
        createdAt: Date.now() - index * 1000 * 20
      })),
    []
  );

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => document.getElementById("messages-scroll"),
    estimateSize: () => 92,
    overscan: 8
  });

  return (
    <div id="messages-scroll" className="min-h-0 flex-1 overflow-auto px-3 py-2">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative"
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={message.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <Message author={message.author} content={message.content} createdAt={message.createdAt} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageList;

