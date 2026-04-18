import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { LogOut, User2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthed, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="sticky top-0 z-40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-3">
        <div className="glass-strong rounded-full px-3 py-2 flex items-center justify-between shadow-soft">
          <Link to="/" className="px-2 py-1 rounded-full">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {isAuthed && (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  activeProps={{ className: "text-foreground bg-secondary" }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-4 py-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  activeProps={{ className: "text-foreground bg-secondary" }}
                >
                  Leaderboard
                </Link>
                <Link
                  to="/search"
                  className="px-4 py-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  activeProps={{ className: "text-foreground bg-secondary" }}
                >
                  AI Search
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthed ? (
              <div className="relative">
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="h-10 pl-1 pr-3 flex items-center gap-2 rounded-full glass hover-lift"
                >
                  <span className="h-8 w-8 rounded-full gradient-accent grid place-items-center text-accent-foreground font-semibold text-xs">
                    {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:block text-sm text-foreground max-w-[120px] truncate">
                    {user?.name || user?.email}
                  </span>
                </button>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl p-2 shadow-elevated"
                  >
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Signed in as
                      <div className="text-foreground text-sm truncate">
                        {user?.email}
                      </div>
                    </div>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate({ to: "/dashboard" });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-sm"
                    >
                      <User2 size={14} /> Profile
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-sm text-destructive"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: "/login" })}
                >
                  Sign in
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => navigate({ to: "/register" })}
                >
                  Get started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
