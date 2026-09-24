import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import TiltCard from "./TiltCard";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import StatIcon3D from "./three/StatIcon3D";

interface Props {
  label: string;
  value: number;
  formatter: (n: number) => string;
  icon: LucideIcon;
  trend?: number;
  accent?: "gold" | "emerald" | "rose" | "sky";
  delay?: number;
}

const accentMap = {
  gold: "from-gold-400/20 text-gold-300 border-gold-400/20",
  emerald: "from-emerald-400/20 text-emerald-300 border-emerald-400/20",
  rose: "from-rose-400/20 text-rose-300 border-rose-400/20",
  sky: "from-sky-400/20 text-sky-300 border-sky-400/20",
};

export default function StatCard({ label, value, formatter, icon: Icon, trend, accent = "gold", delay = 0 }: Props) {
  const positive = (trend ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <TiltCard className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
            <AnimatedNumber
              value={value}
              formatter={formatter}
              className="mt-2 block font-display text-2xl font-semibold text-white sm:text-[28px]"
            />
          </div>
          <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br to-transparent ${accentMap[accent]}`}>
            <StatIcon3D accent={accent} className="absolute inset-0 rounded-xl overflow-hidden" />
            <Icon className="relative z-10 h-5 w-5 drop-shadow-sm" strokeWidth={1.75} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? "text-emerald-400" : "text-rose-400"}`}>
              {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-xs text-white/30">vs last month</span>
          </div>
        )}
      </TiltCard>
    </motion.div>
  );
}