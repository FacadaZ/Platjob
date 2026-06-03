import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      <div className="w-20 h-20 rounded-3xl bg-brand-gradient/10 border border-brand-blue/10 flex items-center justify-center mb-6">
        <Icon className="w-9 h-9 text-brand-blue/50" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary text-sm max-w-xs mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  );
}
