import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-white/[0.06] bg-white/[0.015] px-8 py-16 text-center">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-400/20 bg-gradient-to-br from-gold-400/10 to-transparent"
      >
        <div className="absolute inset-0 rounded-2xl bg-gold-400/10 blur-xl" />
        <Icon className="relative h-7 w-7 text-gold-300" strokeWidth={1.5} />
      </motion.div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="font-display text-lg font-semibold text-white/90">{title}</h3>
        <p className="text-sm leading-relaxed text-white/40">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}