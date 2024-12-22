"use client";

import { Room } from "@/types/room";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { useChat } from "@/hooks/use-chat";
import { useEffect } from "react";

interface ChatRoomProps {
  room: Room;
}

export function ChatRoom({ room }: ChatRoomProps) {
  const {
    messages,
    loadMessages,
    sendMessage,
    sendFile,
    typingUsers,
    emitTyping,
    emitStopTyping,
  } = useChat();

  useEffect(() => {
    loadMessages(room._id);
  }, [room._id]);

  const handleSendMessage = (content: string) => {
    sendMessage(room._id, content);
  };

  const handleFileSelect = async (file: File) => {
    await sendFile(room._id, file);
  };

  const handleTyping = (roomId: string) => {
    emitTyping(roomId);
  };

  const handleStopTyping = (roomId: string) => {
    emitStopTyping(roomId);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatMessages messages={messages} typingUser={typingUsers[room._id]} />
      <ChatInput
        onSend={handleSendMessage}
        onFileSelect={handleFileSelect}
        roomId={room._id}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
}
