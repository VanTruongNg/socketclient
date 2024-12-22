'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isAuthenticated && user) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // Nếu đã xác thực, không render gì cả
  if (isAuthenticated && user) {
    return null;
  }

  // Nếu chưa xác thực, render children
  return <>{children}</>;
};
