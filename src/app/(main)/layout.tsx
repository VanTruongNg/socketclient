"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useSocket } from "@/hooks/use-socket";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSocket();

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
