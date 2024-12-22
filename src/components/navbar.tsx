"use client";

import { useAuthStore } from "@/store/use-auth-store";
import { useLogout } from "@/hooks/use-auth";

export function Navbar() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="font-semibold">Chat App</div>
        <div className="flex items-center gap-4">
          <span>{user?.username}</span>
          <button
            onClick={() => logout()}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}
