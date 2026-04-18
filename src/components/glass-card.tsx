import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import * as React from "react";

export function GlassCard({
  className,
  children,
  hover = true,
  glow = false,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; glow?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "glass rounded-3xl p-5 relative overflow-hidden",
        hover && "hover-lift",
        glow && "shadow-glow",
        className,
      )}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  );
}
