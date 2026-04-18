import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? 22 : size === "lg" ? 36 : 28;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="relative grid place-items-center rounded-xl gradient-accent shadow-glow"
        style={{ width: dim, height: dim }}
      >
        <svg
          viewBox="0 0 24 24"
          width={dim * 0.62}
          height={dim * 0.62}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent-foreground"
        >
          <path d="M4 18 L10 12 L14 16 L20 6" />
          <path d="M14 6 H20 V12" />
        </svg>
      </div>
      <span
        className="font-semibold tracking-tight text-foreground"
        style={{ fontSize: dim * 0.62 }}
      >
        Trackademic
      </span>
    </div>
  );
}
