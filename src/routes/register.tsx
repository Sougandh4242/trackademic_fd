import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, UserPlus, GraduationCap, BookUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { register as apiRegister } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { redirectByRole, AuthHero, Field, inputCls } from "./login";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Trackademic" },
      {
        name: "description",
        content: "Create your Trackademic profile in seconds.",
      },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
  role: z.enum(["student", "faculty"]),
  usn: z.string().trim().max(40).optional().or(z.literal("")),
  department: z.string().trim().max(80).optional().or(z.literal("")),
});
type FormVals = z.infer<typeof schema>;

function RegisterPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { role: "student" },
  });

  const role = watch("role");

  async function onSubmit(values: FormVals) {
    setSubmitting(true);
    try {
      const { user, token } = await apiRegister({
        ...values,
        usn: values.usn || undefined,
        department: values.department || undefined,
      });
      refresh();
      toast.success("Account created", {
        description: "Welcome to Trackademic 🎉",
      });
      if (token) {
        redirectByRole(user, navigate);
      } else {
        navigate({ to: "/login" });
      }
    } catch (e: any) {
      toast.error("Couldn't create account", { description: e?.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] grid lg:grid-cols-2">
      <AuthHero
        eyebrow="Create account"
        title="Build your Trackademic profile."
        body="Add skills, upload certificates, log projects — and let AI surface your talent."
      />

      <div className="flex items-center justify-center px-6 py-16">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-elevated"
        >
          <h1 className="text-2xl font-semibold text-foreground">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Free for students and faculty.
          </p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-secondary/40 border border-border">
            <RoleChip
              active={role === "student"}
              onClick={() => setValue("role", "student", { shouldValidate: true })}
              icon={<GraduationCap size={16} />}
              label="Student"
            />
            <RoleChip
              active={role === "faculty"}
              onClick={() => setValue("role", "faculty", { shouldValidate: true })}
              icon={<BookUser size={16} />}
              label="Faculty"
            />
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Full name" error={errors.name?.message}>
              <input
                placeholder="Ada Lovelace"
                className={inputCls}
                {...register("name")}
              />
            </Field>
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
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className={inputCls}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-3 grid place-items-center text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              {role === "student" ? (
                <Field label="USN" error={errors.usn?.message}>
                  <input
                    placeholder="1AB23CS456"
                    className={inputCls}
                    {...register("usn")}
                  />
                </Field>
              ) : (
                <Field label="Faculty ID" error={errors.usn?.message}>
                  <input
                    placeholder="FAC-1023"
                    className={inputCls}
                    {...register("usn")}
                  />
                </Field>
              )}
              <Field label="Department" error={errors.department?.message}>
                <input
                  placeholder="CSE"
                  className={inputCls}
                  {...register("department")}
                />
              </Field>
            </div>
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
                <UserPlus size={16} /> Create account
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}

function RoleChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all",
        active
          ? "gradient-accent text-accent-foreground shadow-glow"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
