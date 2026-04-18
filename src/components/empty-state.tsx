import { motion } from "framer-motion";

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-10 text-center flex flex-col items-center gap-3"
    >
      <div className="h-14 w-14 rounded-2xl gradient-accent grid place-items-center text-accent-foreground shadow-glow">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
