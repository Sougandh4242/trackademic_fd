import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, type AuthUser } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Trackademic" },
      { name: "description", content: "Sign in to your Trackademic account." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
});
type FormVals = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormVals>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormVals) {
    setSubmitting(true);
    try {
      const { user } = await login(values);
      refresh();
      toast.success("Welcome back!", {
        description: user.name ? `Signed in as ${user.name}` : undefined,
      });
      redirectByRole(user, navigate);
    } catch (e: any) {
      toast.error("Couldn't sign in", { description: e?.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] grid lg:grid-cols-2">
      <AuthHero
        eyebrow="Welcome back"
        title="Continue your journey."
        body="Pick up where you left off — your skills, projects and wins are waiting."
      />

      <div className="flex items-center justify-center px-6 py-16">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-elevated"
        >
          <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Use your Trackademic credentials.
          </p>

          <div className="mt-6 space-y-4">
            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@college.edu"
                className={inputCls}
                {...register("email")}
              />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={inputCls}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-3 grid place-items-center text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full mt-6"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <LogIn size={16} /> Sign in
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            New here?{" "}
            <Link to="/register" className="text-foreground hover:underline">
              Create an account
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}

export function redirectByRole(user: AuthUser, navigate: ReturnType<typeof useNavigate>) {
  if (user.role === "faculty") {
    navigate({ to: "/faculty" });
  } else {
    navigate({ to: "/dashboard" });
  }
}

export const inputCls =
  "w-full h-11 rounded-xl bg-secondary/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

export function AuthHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between px-12 py-16 overflow-hidden">
      <div className="z-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground">
          {eyebrow}
        </span>
        <h2 className="mt-6 text-5xl font-semibold tracking-tight text-gradient leading-[1.05] max-w-md">
          {title}
        </h2>
        <p className="mt-4 text-muted-foreground max-w-md">{body}</p>
      </div>
      <div className="z-10 grid grid-cols-3 gap-3 max-w-md">
        {["Skills", "Projects", "Hackathons"].map((k, i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="glass rounded-2xl p-4"
          >
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {[34, 9, 5][i]}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
