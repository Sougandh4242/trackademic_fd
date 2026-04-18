import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, Sparkles } from "lucide-react";
import { authStore } from "@/lib/auth";
import { aiApi } from "@/lib/services";
import { GlassCard } from "@/components/glass-card";
import { ChatWidget } from "@/components/chat-widget";
import { Button } from "@/components/ui/button";
import { inputCls } from "./login";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/search")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !authStore.getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "AI Search — Trackademic" },
      {
        name: "description",
        content:
          "Find students by skill, project domain or experience with semantic search.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  async function run(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    try {
      const res = await aiApi.semanticSearch(q.trim());
      const list: any[] = res?.results || res?.matches || res?.data || res || [];
      setResults(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast.error("Search failed", { description: e?.message });
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground">
          <Sparkles size={12} className="text-accent" /> Semantic AI
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-gradient">
          Find the right student.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Try: "React students with hackathon wins" or "ML interns from CSE".
        </p>
      </motion.div>

      <form
        onSubmit={run}
        className="mt-8 glass-strong rounded-2xl p-2 flex items-center gap-2 shadow-soft"
      >
        <Search className="ml-3 text-muted-foreground" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search students by skill, project, hackathon…"
          className={cn(inputCls, "border-0 bg-transparent focus:ring-0 h-11")}
        />
        <Button type="submit" variant="accent" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={14} /> : "Search"}
        </Button>
      </form>

      <div className="mt-8 grid gap-4">
        {busy && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-3xl skeleton" />
            ))}
          </>
        )}
        {!busy && results !== null && results.length === 0 && (
          <EmptyState
            icon={<Search size={20} />}
            title="No matches"
            description="Try broadening your query or different keywords."
          />
        )}
        {!busy &&
          results?.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full gradient-accent grid place-items-center text-accent-foreground font-semibold">
                    {(r.name || r.usn || "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">
                      {r.name || r.title || "Match"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.usn ? r.usn + " · " : ""}
                      {r.department || ""}
                    </div>
                    {r.snippet || r.description ? (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {r.snippet || r.description}
                      </p>
                    ) : null}
                    {Array.isArray(r.skills) && r.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {r.skills.slice(0, 6).map((s: any, j: number) => (
                          <span
                            key={j}
                            className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-foreground"
                          >
                            {s?.name || s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {typeof r.score === "number" && (
                    <div className="text-right shrink-0">
                      <div className="text-lg font-semibold text-foreground tabular-nums">
                        {(r.score * 100).toFixed(0)}%
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Match
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
      </div>

      <ChatWidget />
    </div>
  );
}
