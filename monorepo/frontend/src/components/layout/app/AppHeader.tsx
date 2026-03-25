"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/primitives/button";
import { LogOut } from "lucide-react";

export function AppHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="h-14 border-b flex items-center justify-between px-6 bg-background shrink-0">
      <div />
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-muted-foreground">{user.email}</span>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </header>
  );
}
