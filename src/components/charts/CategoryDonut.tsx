import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import type { CategorySlice } from "../../lib/chartData";
import { formatCurrency } from "../../lib/format";
import ChartTooltip from "./ChartTooltip";

interface Props {
  data: CategorySlice[];
  currency: string;
  onCategoryClick?: (category: string) => void;
}

interface RenderedSlice {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  midAngle?: number;
  fill?: string;
  percent?: number;
  payload?: CategorySlice;
}

/** Animated donut: slices expand + glow on hover, center shows total or hovered category, click filters. */
export default function CategoryDonut({ data, currency, onCategoryClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = data.reduce((s, d) => s + d.amount, 0);
  const active = data.find((d) => d.category === hovered) ?? null;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative h-56 w-56 shrink-0 sm:h-64 sm:w-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip currency={currency} mode="category" />} />
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="rgba(10,11,15,0.6)"
              strokeWidth={2}
              animationDuration={700}
              animationEasing="ease-out"
              onMouseEnter={(_, i) => setHovered(data[i]?.category ?? null)}
              onMouseLeave={() => setHovered(null)}
              onClick={(_, i) => {
                const category = data[i]?.category;
                if (category && onCategoryClick) onCategoryClick(category);
              }}
            >
              {data.map((entry) => {
                const isHovered = hovered === entry.category;
                const rendered: RenderedSlice = {};
                return (
                  <Cell
                    key={entry.category}
                    fill={entry.color}
                    style={{
                      cursor: onCategoryClick ? "pointer" : "default",
                      filter: isHovered ? `drop-shadow(0 0 10px ${entry.color}90)` : undefined,
                      transformOrigin: "center",
                      transform: isHovered ? "scale(1.045)" : undefined,
                      transition: "filter 0.25s ease, transform 0.25s ease",
                      opacity: hovered && !isHovered ? 0.45 : 1,
                    }}
                    {...rendered}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center metric */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="max-w-[70%] truncate text-[11px] font-medium uppercase tracking-wider text-white/40">
            {active ? active.category : "Total Spent"}
          </p>
          <p className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
            {formatCurrency(active ? active.amount : total, currency)}
          </p>
          {active && <p className="text-[11px] text-gold-300">{active.share}% of total</p>}
        </div>
      </div>

      {/* Legend */}
      <div className="w-full min-w-0 space-y-1.5">
        {data.length === 0 && <p className="text-xs text-white/35">No expenses recorded in this range.</p>}
        {data.slice(0, 6).map((d, i) => (
          <motion.button
            key={d.category}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onMouseEnter={() => setHovered(d.category)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onCategoryClick?.(d.category)}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/[0.05]"
            style={{ opacity: hovered && hovered !== d.category ? 0.5 : 1 }}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate text-sm text-white/75">{d.category}</span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-white/85">{formatCurrency(d.amount, currency)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
