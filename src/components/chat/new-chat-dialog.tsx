"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRoom } from "@/hooks/use-room";
import { User } from "@/types/auth";
import { useAuthStore } from "@/store/use-auth-store";
import { MessageCircle } from "lucide-react";

interface NewChatDialogProps {
  users: User[];
}

export function NewChatDialog({ users }: NewChatDialogProps) {
  const [open, setOpen] = useState(false);
  const { user: currentUser } = useAuthStore();
  const { createPrivateRoom } = useRoom();

  // Lọc ra những user khác, không hiển thị current user
  const otherUsers = users.filter((user) => user._id !== currentUser?._id);

  const handleSelect = (userId: string) => {
    createPrivateRoom(userId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mb-4">
          <MessageCircle className="w-4 h-4 mr-2" />
          Tạo đoạn chat mới
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo đoạn chat mới</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] mt-4">
          <div className="space-y-4">
            {otherUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => handleSelect(user._id)}
              >
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
