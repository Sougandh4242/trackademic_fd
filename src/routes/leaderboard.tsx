import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Filter, Search, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { authStore } from "@/lib/auth";
import { facultyApi } from "@/lib/services";
import { GlassCard } from "@/components/glass-card";
import { ChatWidget } from "@/components/chat-widget";
import { cn } from "@/lib/utils";
import { inputCls } from "./login";

export const Route = createFileRoute("/leaderboard")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !authStore.getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Leaderboard — Trackademic" },
      {
        name: "description",
        content: "Top students across departments, ranked by activity.",
      },
    ],
  }),
  component: LeaderboardPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-destructive">Error: {error.message}</div>
  ),
});

function LeaderboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dept, setDept] = useState<string>("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await facultyApi.topStudents();
        const list: any[] = res?.students || res?.data || res || [];
        setData(Array.isArray(list) ? list : []);
      } catch (e: any) {
        toast.error("Couldn't load leaderboard", { description: e?.message });
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    data.forEach((s) => s?.department && set.add(s.department));
    return ["All", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    return data
      .filter((s) => (dept === "All" ? true : s.department === dept))
      .filter((s) => {
        if (!q.trim()) return true;
        const t = q.toLowerCase();
        return (
          (s.name || "").toLowerCase().includes(t) ||
          (s.usn || "").toLowerCase().includes(t) ||
          (s.department || "").toLowerCase().includes(t)
        );
      })
      .sort(
        (a, b) =>
          (b.score ?? b.activity_score ?? 0) -
          (a.score ?? a.activity_score ?? 0),
      );
  }, [data, dept, q]);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const chartData = filtered.slice(0, 10).map((s) => ({
    name: (s.name || s.usn || "—").slice(0, 8),
    score: s.score ?? s.activity_score ?? 0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gradient">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Top students by activity score.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className={cn(inputCls, "pl-9 w-56")}
            />
          </div>
          <div className="relative">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className={cn(inputCls, "pl-9 pr-8 appearance-none cursor-pointer")}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-3xl skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Trophy className="mx-auto mb-3 text-muted-foreground" />
          <div className="text-foreground font-medium">No students yet</div>
          <p className="text-sm text-muted-foreground">
            Once students join and add activity, they'll appear here.
          </p>
        </GlassCard>
      ) : (
        <>
          {/* Podium */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {top3.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "relative glass rounded-3xl p-5 hover-lift",
                  i === 0 && "shadow-glow border-accent/30",
                )}
              >
                {i === 0 && (
                  <Crown
                    className="absolute -top-3 left-5 text-accent"
                    size={22}
                  />
                )}
                <div className="flex items-center gap-3">
                  <Avatar name={s.name || s.usn || "—"} />
                  <div className="min-w-0">
                    <div className="text-foreground font-semibold truncate">
                      {s.name || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.usn || ""} {s.department && `· ${s.department}`}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-semibold text-foreground tabular-nums">
                      {s.score ?? s.activity_score ?? 0}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      #{i + 1}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Table */}
            <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="text-sm font-semibold text-foreground">
                  All students
                </div>
              </div>
              <div className="divide-y divide-border">
                {rest.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">
                    Top 3 cover everyone.
                  </div>
                ) : (
                  rest.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/40 transition"
                    >
                      <div className="w-8 text-sm text-muted-foreground tabular-nums">
                        #{i + 4}
                      </div>
                      <Avatar name={s.name || "—"} sm />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {s.name || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {s.usn || ""} {s.department && `· ${s.department}`}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-foreground tabular-nums">
                        {s.score ?? s.activity_score ?? 0}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Chart */}
            <GlassCard>
              <div className="text-sm font-semibold text-foreground mb-3">
                Top 10 — score
              </div>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.78 0.18 150)" />
                        <stop offset="100%" stopColor="oklch(0.7 0.18 230)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(1 0 0 / 8%)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "oklch(1 0 0 / 4%)" }}
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        color: "var(--color-foreground)",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="score"
                      fill="url(#bar-grad)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </>
      )}

      <ChatWidget />
    </div>
  );
}

function Avatar({ name, sm }: { name: string; sm?: boolean }) {
  const size = sm ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  return (
    <div
      className={cn(
        "rounded-full gradient-accent text-accent-foreground font-semibold grid place-items-center",
        size,
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
