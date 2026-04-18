import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { authStore, type AuthUser } from "@/lib/auth";

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  isAuthed: boolean;
  refresh: () => void;
  signOut: () => void;
}

const Ctx = React.createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => authStore.getUser());
  const [token, setToken] = React.useState<string | null>(() => authStore.getToken());
  const navigate = useNavigate();

  const refresh = React.useCallback(() => {
    setUser(authStore.getUser());
    setToken(authStore.getToken());
  }, []);

  React.useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("trackademic:auth", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("trackademic:auth", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  const signOut = React.useCallback(() => {
    authStore.clear();
    navigate({ to: "/login" });
  }, [navigate]);

  return (
    <Ctx.Provider
      value={{ user, token, isAuthed: Boolean(token), refresh, signOut }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
