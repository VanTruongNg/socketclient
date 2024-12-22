"use client";

import { User } from "@/types/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/hooks/use-room";
import { useAuthStore } from "@/store/use-auth-store";

interface OnlineUsersProps {
  users: User[];
}

export function OnlineUsers({ users }: OnlineUsersProps) {
  const { user: currentUser } = useAuthStore();
  const { createPrivateRoom } = useRoom();

  // Lọc ra những user khác, không hiển thị current user
  const otherUsers = users.filter((user) => user._id !== currentUser?._id);

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="font-semibold">
        Người dùng trực tuyến ({otherUsers.length})
      </h2>
      <ScrollArea className="flex-1 mt-4">
        <div className="space-y-4">
          {otherUsers.map((user) => (
            <div key={user._id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => createPrivateRoom(user._id)}
              >
                Nhắn tin
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
