"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated || !user) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, router]);

  // Khi đang loading hoặc chưa xác thực, không render gì cả
  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  // Nếu đã xác thực và không còn loading, render children
  return <>{children}</>;
};
