import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { authStore } from "@/lib/auth";
import { GlassCard } from "@/components/glass-card";
import { ChatWidget } from "@/components/chat-widget";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/faculty")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !authStore.getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Faculty Dashboard — Trackademic" },
      {
        name: "description",
        content: "Discover top students with analytics and AI search.",
      },
    ],
  }),
  component: FacultyPage,
});

function FacultyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gradient">
          Faculty Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover talent with leaderboards & AI semantic search.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <FacultyCard
          to="/leaderboard"
          icon={<Trophy />}
          title="Leaderboard"
          desc="Top students ranked by activity, filterable by department."
        />
        <FacultyCard
          to="/search"
          icon={<Users />}
          title="AI Semantic Search"
          desc="Find students by skill, project domain, or experience — naturally."
        />
        <FacultyCard
          to="/leaderboard"
          icon={<BarChart3 />}
          title="Analytics"
          desc="Department-level performance trends and insights."
        />
      </div>

      <ChatWidget />
    </div>
  );
}

function FacultyCard({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <GlassCard>
      <div className="h-11 w-11 rounded-xl gradient-accent grid place-items-center text-accent-foreground shadow-glow">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <Link
        to={to as any}
        className="mt-4 inline-flex items-center gap-1 text-sm text-foreground hover:text-accent"
      >
        Open <ArrowRight size={14} />
      </Link>
    </GlassCard>
  );
}
