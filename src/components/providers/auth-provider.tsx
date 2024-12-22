"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/use-auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Hydrate store từ localStorage
    useAuthStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  // Không render children cho đến khi đã hydrate xong
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
