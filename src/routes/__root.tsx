
import {
  Outlet,
  createRootRoute,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useEffect } from "react";

import { AmbientBackground } from "@/components/ambient-background";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/hooks/use-auth";
import { initTheme } from "@/lib/theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass rounded-3xl p-10 max-w-md text-center shadow-elevated">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex mt-6 items-center justify-center rounded-full gradient-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-glow"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <AuthProvider>
      {/* ⚠️ If lag happens, comment this line */}
      <AmbientBackground />

      <Navbar />

      <main className="relative">
        <Outlet />
      </main>

      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          className:
            "!glass-strong !rounded-2xl !text-foreground !border !border-border",
        }}
      />
    </AuthProvider>
  );
}
