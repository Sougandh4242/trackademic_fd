import { useEffect, useRef } from "react";

/**
 * Animated aurora blobs + cursor-reactive glow.
 * Pure CSS gradients & a small mousemove handler — cheap and beautiful.
 */
export function AmbientBackground({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden gradient-hero noise"
      style={{
        // cursor glow
        backgroundImage: `radial-gradient(600px circle at var(--mx,50%) var(--my,30%), oklch(0.72 0.18 145 / ${0.12 * intensity}), transparent 60%), var(--gradient-hero)`,
      }}
    >
      <div
        className="aurora-blob"
        style={{
          width: 520,
          height: 520,
          top: "-10%",
          right: "-10%",
          background:
            "radial-gradient(circle, oklch(0.72 0.18 145 / 0.55), transparent 60%)",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: 460,
          height: 460,
          bottom: "-15%",
          left: "-10%",
          background:
            "radial-gradient(circle, oklch(0.7 0.18 230 / 0.5), transparent 60%)",
          animationDelay: "-4s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: 320,
          height: 320,
          top: "30%",
          left: "40%",
          background:
            "radial-gradient(circle, oklch(0.66 0.22 320 / 0.35), transparent 60%)",
          animationDelay: "-8s",
        }}
      />
    </div>
  );
}
