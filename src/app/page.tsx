"use client";

import { Navbar } from "@/components/navbar";
import { OnlineUsers } from "@/components/chat/online-users";
import { RoomList } from "@/components/chat/room-list";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { useChat } from "@/hooks/use-chat";
import { useState } from "react";
import { Room } from "@/types/room";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Video, Phone } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { useCall } from "@/hooks/use-call";
import { CallModal } from "@/components/call/call-modal";
import { CallScreen } from "@/components/call/call-screen";

export default function Home() {
  const { onlineUsers, rooms, messages, loadMessages, sendMessage, sendFile } =
    useChat();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { user: currentUser } = useAuthStore();

  const {
    isIncomingCall,
    isCallActive,
    remoteStream,
    localStream,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
  } = useCall({ roomId: selectedRoom?._id || "" });

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    loadMessages(room._id);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedRoom) return;
    sendMessage(selectedRoom._id, content);
  };

  const handleFileSelect = async (file: File) => {
    if (!selectedRoom) return;
    await sendFile(selectedRoom._id, file);
  };

  const getRoomName = (room: Room) => {
    if (room.type === "GROUP") return room.name;
    if (!room.participants?.length) return "Unknown User";

    const otherUser = room.participants.find(
      (member) => String(member._id) !== String(currentUser?.id)
    );
    return otherUser?.username || "Unknown User";
  };

  const getRoomAvatar = (room: Room) => {
    if (room.type === "GROUP") return undefined;
    if (!room.participants?.length) return undefined;

    const otherUser = room.participants.find(
      (member) => String(member._id) !== String(currentUser?.id)
    );
    return otherUser?.avatar;
  };

  const handleVideoCallClick = () => {
    console.log("Video call button clicked", {
      roomId: selectedRoom?._id,
      currentUser: currentUser?.id,
      isCallActive,
    });

    try {
      initiateCall();
    } catch (error) {
      console.error("Error initiating call:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 grid grid-cols-[300px_1fr] overflow-hidden">
        {/* Sidebar */}
        <div className="border-r flex flex-col overflow-hidden">
          <div className="h-[200px] border-b overflow-hidden">
            <OnlineUsers users={onlineUsers} />
          </div>
          <div className="flex-1 overflow-hidden">
            <RoomList
              rooms={rooms}
              onlineUsers={onlineUsers}
              onSelect={handleRoomSelect}
              selectedId={selectedRoom?._id}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col overflow-hidden">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={getRoomAvatar(selectedRoom)} />
                    <AvatarFallback>
                      {getRoomName(selectedRoom)?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {getRoomName(selectedRoom)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedRoom.participants?.length} thành viên
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVideoCallClick}
                    disabled={isCallActive}
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <ChatMessages messages={messages} />
              </div>
              <ChatInput
                roomId={selectedRoom._id}
                onSend={handleSendMessage}
                onFileSelect={handleFileSelect}
              />

              <CallModal
                isOpen={isIncomingCall}
                callerName={getRoomName(selectedRoom)}
                onAccept={acceptCall}
                onReject={rejectCall}
              />

              <CallScreen
                isOpen={isCallActive}
                localStream={localStream}
                remoteStream={remoteStream}
                onEndCall={endCall}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Chọn một đoạn chat để bắt đầu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
