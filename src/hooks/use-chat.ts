"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { useSocket } from "./use-socket";
import { User } from "@/types/auth";
import { Room } from "@/types/room";
import { Message } from "@/types/message";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useChat() {
  const socket = useSocket();
  const { user } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<{[key: string]: string}>({});
  const typingTimeoutRef = useRef<{[key: string]: NodeJS.Timeout}>({});

  useEffect(() => {
    if (!socket || !user) return;

    socket.on("users:online", (users: User[]) => {
      setOnlineUsers(users);
    });

    socket.on("rooms:list", (rooms: Room[]) => {
      setRooms(rooms);
      setLoading(false);
    });

    socket.on("room:created", (room: Room) => {
      setRooms((prev) => [...prev, room]);
    });

    socket.on("room:updated", (updatedRoom: Room) => {
      setRooms((prev) =>
        prev.map((room) => (room._id === updatedRoom._id ? updatedRoom : room))
      );
    });

    socket.on("message:new", (message: Message) => {
      if (message.chatroom === selectedRoomId) {
        setMessages((prev) =>
          [...prev, message].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        );
      }

      setRooms((prev) =>
        prev.map((room) => {
          if (room._id === message.chatroom) {
            return {
              ...room,
              lastMessage: {
                content: message.content,
                sender: message.sender,
                timestamp: message.createdAt,
              },
            };
          }
          return room;
        })
      );
    });

    socket.on(
      "messages:list",
      (data: {
        messages: Message[];
        total: number;
        page: number;
        totalPages: number;
      }) => {
        console.log("Old messages received:", data);
        const sortedMessages = data.messages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
      }
    );

    socket.on("user:typing", ({ roomId, userId, username }) => {
      if (roomId === selectedRoomId) {
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: username
        }));

        // Clear typing status after 3 seconds
        if (typingTimeoutRef.current[roomId]) {
          clearTimeout(typingTimeoutRef.current[roomId]);
        }
        typingTimeoutRef.current[roomId] = setTimeout(() => {
          setTypingUsers(prev => {
            const newState = { ...prev };
            delete newState[roomId];
            return newState;
          });
        }, 3000);
      }
    });

    socket.on("user:stop-typing", ({ roomId }) => {
      if (roomId === selectedRoomId) {
        setTypingUsers(prev => {
          const newState = { ...prev };
          delete newState[roomId];
          return newState;
        });
      }
    });

    return () => {
      socket.off("users:online");
      socket.off("rooms:list");
      socket.off("room:created");
      socket.off("room:updated");
      socket.off("message:new");
      socket.off("messages:list");
      socket.off("user:typing");
      socket.off("user:stop-typing");
      Object.values(typingTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, [socket, user, selectedRoomId]);

  const loadMessages = (roomId: string, page: number = 1) => {
    if (!socket) return;
    setSelectedRoomId(roomId);
    socket.emit("messages:get", { roomId, page, limit: 20 });
  };

  const sendMessage = (roomId: string, content: string) => {
    if (!socket) return;
    socket.emit("message:send", { roomId, content });
  };

  const sendFile = async (roomId: string, file: File) => {
    if (!socket) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomId", roomId);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Upload response:", data);

      socket.emit("message:send", {
        roomId,
        content: data.name || 'Đã gửi một file',
        type: file.type.startsWith("image/") ? "image" : "file",
        file: {
          url: data.url,
          name: data.name,
          size: data.size,
          type: data.type,
        },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const emitTyping = (roomId: string) => {
    if (!socket || !user) return;
    socket.emit("user:typing", { roomId });
  };

  const emitStopTyping = (roomId: string) => {
    if (!socket || !user) return;
    socket.emit("user:stop-typing", { roomId });
  };

  return {
    onlineUsers,
    rooms,
    messages,
    loading,
    currentPage,
    totalPages,
    loadMessages,
    sendMessage,
    sendFile,
    typingUsers,
    emitTyping,
    emitStopTyping,
  };
} 