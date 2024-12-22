"use client";

import { Message } from "@/types/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInMinutes, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileIcon, FileText, FileSpreadsheet, File } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  typingUser?: string;
}

export function ChatMessages({ messages, typingUser }: ChatMessagesProps) {
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto scroll to bottom when new messages arrive or when opening room
  useEffect(() => {
    // Scroll after a longer delay to ensure content is fully rendered
    const timeoutId = setTimeout(scrollToBottom, 300);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Kiểm tra xem tin nhắn có phải chỉ chứa emoji không
  const isOnlyEmojis = (text: string) => {
    const emojiRegex =
      /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2000}-\u{206F}\u{2100}-\u{214F}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2460}-\u{24FF}\u{2500}-\u{257F}\u{25A0}-\u{25FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2900}-\u{297F}\u{2B00}-\u{2BFF}\u{3000}-\u{303F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F910}-\u{1F96B}\u{1F980}-\u{1F9E0}]+$/u;
    return emojiRegex.test(text);
  };

  // Kiểm tra xem có phải tin nhắn đầu tiên của ngày không
  const isFirstMessageOfDay = (message: Message, index: number) => {
    if (index === 0) return true;

    const currentDate = new Date(message.createdAt);
    const previousDate = new Date(messages[index - 1].createdAt);

    return (
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    );
  };

  // Kiểm tra xem có phải tin nhắn đầu tiên của group không
  const isFirstMessageOfGroup = (message: Message, index: number) => {
    if (index === 0) return true;

    const previousMessage = messages[index - 1];
    const currentDate = new Date(message.createdAt);
    const previousDate = new Date(previousMessage.createdAt);

    // Nếu khác người gửi hoặc cách nhau hơn 1 phút thì là tin nhắn đầu tiên của group mới
    return (
      String(message.sender._id) !== String(previousMessage.sender._id) ||
      differenceInMinutes(currentDate, previousDate) >= 1
    );
  };

  // Format ngày
  const formatMessageDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return "Hôm nay";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear()
    ) {
      return "Hôm qua";
    }

    return messageDate.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format thời gian chi tiết
  const formatDetailTime = (date: Date) => {
    return format(date, "HH:mm - EEEE, dd/MM/yyyy", { locale: vi });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file icon based on MIME type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) {
      return <FileText className="w-8 h-8" />;
    }
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return <FileSpreadsheet className="w-8 h-8" />;
    }
    if (mimeType.includes("document") || mimeType.includes("text")) {
      return <FileText className="w-8 h-8" />;
    }
    return <FileIcon className="w-8 h-8" />;
  };

  // Render message content
  const renderMessageContent = (message: Message) => {
    if (message.fileUrl) {
      if (message.fileMimeType?.startsWith("image/")) {
        return (
          <img
            src={message.fileUrl}
            alt={message.fileName}
            className="max-w-sm rounded-lg cursor-pointer"
            onClick={() => window.open(message.fileUrl, "_blank")}
          />
        );
      }
      const isCurrentUser =
        message.sender._id === currentUser?.id ||
        message.sender.id === currentUser?.id;
      return (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 min-w-[200px]"
        >
          <div
            className={cn(
              "p-2 rounded",
              isCurrentUser ? "bg-primary-foreground" : "bg-background"
            )}
          >
            {getFileIcon(message.fileMimeType || "")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">{message.fileName}</div>
            <div className="text-xs text-muted-foreground">
              {formatFileSize(message.fileSize || 0)}
            </div>
          </div>
        </a>
      );
    }

    return (
      <div
        className={cn(
          "whitespace-pre-wrap break-words",
          message.type === "EMOJI" && "flex items-center"
        )}
      >
        {message.content}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser =
              message.sender._id === currentUser?.id ||
              message.sender.id === currentUser?.id;
            const onlyEmojis = isOnlyEmojis(message.content);
            const isFirstInGroup = isFirstMessageOfGroup(message, index);
            const showAvatar = isFirstInGroup;
            const showName = isFirstInGroup && !isCurrentUser;

            return (
              <div key={message._id} className="space-y-4">
                {isFirstMessageOfDay(message, index) && (
                  <div className="flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">
                      {formatMessageDate(new Date(message.createdAt))}
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "flex items-end gap-2",
                    isCurrentUser && "flex-row-reverse"
                  )}
                >
                  {!isCurrentUser && (
                    <div className="w-8">
                      {showAvatar && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.sender.avatar} />
                          <AvatarFallback>
                            {message.sender.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-1 max-w-[70%]">
                    {showName && (
                      <div className="text-sm font-medium ml-1">
                        {message.sender.username}
                      </div>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "rounded-lg p-3 w-fit",
                              onlyEmojis ? "text-4xl leading-none" : "",
                              isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted",
                              !isFirstInGroup &&
                                (isCurrentUser
                                  ? "rounded-tr-sm"
                                  : "rounded-tl-sm")
                            )}
                          >
                            {renderMessageContent(message)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {formatDetailTime(new Date(message.createdAt))}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {isCurrentUser && (
                    <div className="w-8">
                      {showAvatar && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={currentUser?.avatar} />
                          <AvatarFallback>
                            {currentUser?.username?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {typingUser && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div>{typingUser} đang nhập...</div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-[1px]" />
        </div>
      </ScrollArea>
    </div>
  );
}
