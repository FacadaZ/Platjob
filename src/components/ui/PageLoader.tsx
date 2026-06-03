import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/HeroUICompat";

/** Full-page loading overlay shown during lazy route loading */
export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand-lg">
          <span className="text-white text-2xl font-bold">P</span>
        </div>
        <Spinner size="lg" color="current" />
      </div>
    </motion.div>
  );
}
