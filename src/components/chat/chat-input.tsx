"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile, PaperclipIcon } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSend: (content: string) => void;
  onFileSelect?: (file: File) => Promise<void>;
  roomId: string;
  onTyping?: (roomId: string) => void;
  onStopTyping?: (roomId: string) => void;
}

export function ChatInput({
  onSend,
  onFileSelect,
  roomId,
  onTyping,
  onStopTyping,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = scrollHeight + "px";
  }, [message]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    onTyping?.(roomId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.(roomId);
    }, 2000);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
    onStopTyping?.(roomId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage((prev) => prev + emoji.native);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      try {
        setIsUploading(true);
        await onFileSelect(file);
        e.target.value = "";
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải lên file. Vui lòng thử lại.",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex items-end gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-full mb-2">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              locale="vi"
            />
          </PopoverContent>
        </Popover>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <PaperclipIcon className="w-5 h-5" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="resize-none max-h-32"
          rows={1}
        />

        <Button onClick={handleSend} disabled={!message.trim() || isUploading}>
          Gửi
        </Button>
      </div>
    </div>
  );
}
