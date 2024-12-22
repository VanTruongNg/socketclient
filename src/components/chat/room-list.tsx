"use client";

import { Room } from "@/types/room";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuthStore } from "@/store/use-auth-store";
import { NewChatDialog } from "./new-chat-dialog";
import { User } from "@/types/auth";

interface RoomListProps {
  rooms: Room[];
  onlineUsers: User[];
  onSelect?: (room: Room) => void;
  selectedId?: string;
}

export function RoomList({
  rooms,
  onlineUsers,
  onSelect,
  selectedId,
}: RoomListProps) {
  const { user: currentUser } = useAuthStore();

  const getRoomName = (room: Room) => {
    if (room.type === "GROUP") return room.name;
    if (!room.participants?.length) {
      return "Unknown User";
    }

    const otherUser = room.participants.find((member) => {
      if (!member?._id || !currentUser?.id) return false;
      return String(member._id) !== String(currentUser.id);
    });

    return otherUser?.username || "Unknown User";
  };

  const getRoomAvatar = (room: Room) => {
    if (room.type === "GROUP") return undefined;
    if (!room.participants?.length) return undefined;

    const otherUser = room.participants.find((member) => {
      if (!member?._id || !currentUser?.id) return false;
      return String(member._id) !== String(currentUser.id);
    });
    return otherUser?.avatar;
  };

  const getLastMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div>
        <NewChatDialog users={onlineUsers} />
        <h2 className="font-semibold">Đoạn chat ({rooms.length})</h2>
      </div>
      <ScrollArea className="flex-1 mt-4">
        <div className="space-y-4">
          {rooms.map((room) => (
            <div
              key={room._id}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer ${
                selectedId === room._id ? "bg-muted" : ""
              }`}
              onClick={() => onSelect?.(room)}
            >
              <Avatar>
                <AvatarImage src={getRoomAvatar(room)} />
                <AvatarFallback>
                  {getRoomName(room)?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {getRoomName(room)}
                  </p>
                  {room.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {getLastMessageTime(room.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                {room.lastMessage ? (
                  <div className="text-sm text-muted-foreground truncate">
                    {room.lastMessage.sender?._id === currentUser?.id
                      ? "Bạn: "
                      : room.lastMessage.sender?.username
                      ? `${room.lastMessage.sender.username}: `
                      : ""}
                    {room.lastMessage.content}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Chưa có tin nhắn
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
