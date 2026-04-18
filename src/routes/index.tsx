import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Trophy,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trackademic — Student Activity Management" },
      {
        name: "description",
        content:
          "The premium way for students to track skills, projects, certifications and hackathons. AI-powered search & analytics for faculty.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  return (
    <div>
      {/* HERO */}
      <section className="relative pt-12 sm:pt-20 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-6">
              <Sparkles size={12} className="text-accent" />
              AI-powered activity intelligence
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-gradient leading-[1.05]">
              Every skill, project & win.
              <br />
              In one beautiful place.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Trackademic is the modern student portfolio system —
              built for students to grow, and faculty to discover talent
              with semantic AI search.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="accent"
                size="xl"
                onClick={() =>
                  navigate({ to: isAuthed ? "/dashboard" : "/register" })
                }
              >
                {isAuthed ? "Open dashboard" : "Get started — it's free"}
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="glass"
                size="xl"
                onClick={() => navigate({ to: "/login" })}
              >
                Sign in
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-accent" /> JWT secured
              </div>
              <div className="flex items-center gap-2">
                <BrainCircuit size={14} className="text-accent" /> Semantic search
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-accent" /> Faculty leaderboards
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16"
          style={{ perspective: 1200 }}
        >
          <div className="glass-strong rounded-[2rem] p-2 shadow-elevated">
            <div className="rounded-[1.6rem] bg-card/60 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <PreviewStat label="Activity Score" value="892" trend="+12%" />
              <PreviewStat label="Skills Tracked" value="34" trend="+4" />
              <PreviewStat label="Projects" value="9" trend="+1" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            <Feature
              icon={<GraduationCap />}
              title="Student-first portfolio"
              text="LinkedIn-quality profile with skills, projects, certifications, internships & hackathons — all editable inline."
            />
            <Feature
              icon={<Trophy />}
              title="Faculty leaderboard"
              text="Surface the top performers across departments with live, filterable rankings."
            />
            <Feature
              icon={<BrainCircuit />}
              title="AI search & chat"
              text="Ask in natural language: 'find React students with hackathon wins' — get ranked results instantly."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] glass-strong p-10 sm:p-14 shadow-elevated">
            <div
              className="absolute -top-20 -right-20 h-72 w-72 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.72 0.18 145 / 0.5), transparent 60%)",
                filter: "blur(40px)",
              }}
            />
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground max-w-2xl">
              Ready to make your achievements impossible to miss?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Build your Trackademic profile in minutes. Free for students.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate({ to: "/register" })}
              >
                Create your profile <ArrowRight size={16} />
              </Button>
              <Link
                to="/leaderboard"
                className="inline-flex items-center px-5 h-12 rounded-full glass text-foreground hover-lift"
              >
                Browse leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="rounded-2xl p-5 bg-secondary/40 border border-border">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-semibold text-foreground">{value}</div>
        <div className="text-xs text-accent">{trend}</div>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full gradient-accent"
          style={{ width: `${40 + Math.random() * 50}%` }}
        />
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <GlassCard className="p-6">
      <div className="h-11 w-11 rounded-xl gradient-accent grid place-items-center text-accent-foreground shadow-glow">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
        {text}
      </p>
    </GlassCard>
  );
}
