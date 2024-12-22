"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    setIsMounted(true);
    console.log("Socket Provider mounted, socket:", !!socket);
  }, [socket]);

  return <>{children}</>;
}
