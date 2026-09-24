import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import type { CashFlowPoint } from "../../lib/chartData";
import ChartTooltip from "./ChartTooltip";

interface Props {
  data: CashFlowPoint[];
  currency: string;
}

const INCOME = "#34d399";
const EXPENSE = "#fb7185";

/** Dual-gradient cash-flow area chart (income vs expenses), monotone curves. */
export default function CashFlowChart({ data, currency }: Props) {
  const hasData = data.some((d) => d.income !== 0 || d.expense !== 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="relative h-64 w-full sm:h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="cf-income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INCOME} stopOpacity={0.45} />
              <stop offset="100%" stopColor={INCOME} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="cf-expense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EXPENSE} stopOpacity={0.4} />
              <stop offset="100%" stopColor={EXPENSE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            minTickGap={24}
          />
          <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} fontSize={11} width={44} />
          <Tooltip
            content={<ChartTooltip currency={currency} mode="cashflow" />}
            cursor={{ stroke: "rgba(227,172,55,0.35)", strokeWidth: 1.5 }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke={INCOME}
            strokeWidth={2.5}
            fill="url(#cf-income)"
            animationDuration={700}
            animationEasing="ease-out"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#0a0b0f" }}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke={EXPENSE}
            strokeWidth={2.5}
            fill="url(#cf-expense)"
            animationDuration={700}
            animationEasing="ease-out"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#0a0b0f" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {!hasData && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="rounded-full border border-white/10 bg-ink-950/70 px-4 py-1.5 text-xs text-white/40 backdrop-blur">
            No activity in this range yet — add a transaction to see your cash flow
          </p>
        </div>
      )}
    </motion.div>
  );
}
