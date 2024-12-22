"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthCheckProps {
  children: React.ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !isAuthPage) {
      router.push("/login");
    }
  }, [isAuthPage, router]);

  return <>{children}</>;
}
