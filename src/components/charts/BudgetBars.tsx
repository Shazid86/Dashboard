import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import type { BudgetComparison } from "../../lib/chartData";
import ChartTooltip from "./ChartTooltip";

interface Props {
  data: BudgetComparison[];
  currency: string;
  onCategoryClick?: (category: string) => void;
}

/**
 * Comparative bars: Budget target (gold outline) vs Actual spend (threshold-colored).
 * Clicking a bar drills into that category's transactions.
 */
export default function BudgetBars({ data, currency, onCategoryClick }: Props) {
  const hasData = data.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="relative w-full"
    >
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="category"
              stroke="var(--chart-axis)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              interval={0}
              tickFormatter={(v: string) => (v.length > 9 ? `${v.slice(0, 9)}…` : v)}
            />
            <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} fontSize={11} width={44} />
            <Tooltip
              content={<ChartTooltip currency={currency} mode="budget" />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar
              dataKey="limit"
              name="Budget"
              fill="transparent"
              stroke="#e3ac37"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              radius={[6, 6, 0, 0]}
              maxBarSize={34}
              animationDuration={600}
            />
            <Bar
              dataKey="spent"
              name="Spent"
              radius={[6, 6, 0, 0]}
              maxBarSize={34}
              animationDuration={600}
              cursor={onCategoryClick ? "pointer" : "default"}
              onClick={(entry: { payload?: BudgetComparison }) => {
                const category = entry?.payload?.category;
                if (category && onCategoryClick) onCategoryClick(category);
              }}
            >
              {data.map((d) => (
                <Cell
                  key={`cell-${d.category}`}
                  fill={d.color}
                  fillOpacity={0.85}
                  style={d.pct > 100 ? { filter: "drop-shadow(0 0 6px rgba(251,113,133,0.6))" } : undefined}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {!hasData && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="rounded-full border border-white/10 bg-ink-950/70 px-4 py-1.5 text-xs text-white/40 backdrop-blur">
            No budgets yet — create one to compare target vs actual
          </p>
        </div>
      )}
    </motion.div>
  );
}

