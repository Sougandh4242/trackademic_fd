import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  ScrollRestoration,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useEffect } from "react";

import appCss from "../styles.css?url";
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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Trackademic — Student Activity Management" },
      {
        name: "description",
        content:
          "Trackademic is a premium student activity management system. Track skills, projects, certifications, internships, and hackathons in one place.",
      },
      { name: "author", content: "Trackademic" },
      { property: "og:title", content: "Trackademic — Student Activity Management" },
      {
        property: "og:description",
        content:
          "Track skills, projects, certifications, internships, and hackathons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <AuthProvider>
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
