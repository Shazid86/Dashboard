import { formatCurrency } from "../../lib/format";

interface Props {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    dataKey?: string | number;
    color?: string;
    payload?: {
      label?: string;
      iso?: string;
      category?: string;
      share?: number;
      count?: number;
      amount?: number;
      pct?: number;
      limit?: number;
      spent?: number;
      color?: string;
    };
  }>;
  label?: string;
  currency: string;
  mode?: "cashflow" | "category" | "budget";
}

/** Shared glassmorphic tooltip for all dashboard charts. */
export default function ChartTooltip({ active, payload, label, currency, mode = "cashflow" }: Props) {
  if (!active || !payload || payload.length === 0) return null;

  const money = (n: number) => formatCurrency(n, currency);

  if (mode === "category") {
    const p = payload[0]?.payload;
    if (!p) return null;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-title">
          {p.category}
        </p>
        <div className="chart-tooltip-rows">
          <div className="chart-tooltip-row">
            <span>Spent</span>
            <span className="text-rose-300">{money(Number(p.amount ?? payload[0]?.value ?? 0))}</span>
          </div>
          <div className="chart-tooltip-row">
            <span>Share</span>
            <span className="text-gold-300">{p.share ?? 0}%</span>
          </div>
          <div className="chart-tooltip-row">
            <span>Txns</span>
            <span className="text-white/60">{p.count ?? 0}</span>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "budget") {
    const p = payload[0]?.payload;
    if (!p) return null;
    const pct = Number(p.pct ?? 0);
    const remaining = Number(p.limit ?? 0) - Number(p.spent ?? 0);
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-title">{p.category}</p>
        <div className="chart-tooltip-rows">
          <div className="chart-tooltip-row">
            <span>Budget</span>
            <span className="text-white/70">{money(Number(p.limit ?? 0))}</span>
          </div>
          <div className="chart-tooltip-row">
            <span>Spent</span>
            <span style={{ color: p.color }}>{money(Number(p.spent ?? 0))}</span>
          </div>
          <div className="chart-tooltip-row">
            <span>{remaining >= 0 ? "Remaining" : "Over by"}</span>
            <span className={remaining >= 0 ? "text-emerald-300" : "text-rose-300"}>
              {money(Math.abs(remaining))}
            </span>
          </div>
          <div className="chart-tooltip-row">
            <span>Used</span>
            <span className="text-gold-300">{pct.toFixed(0)}%</span>
          </div>
        </div>
        <p className="chart-tooltip-hint">Click to view these transactions</p>
      </div>
    );
  }

  // cashflow mode
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-title">{label}</p>
      <div className="chart-tooltip-rows">
        {payload.map((entry, i) => {
          const key = String(entry.dataKey ?? entry.name ?? i);
          const isIn = key === "income";
          const isNet = key === "net";
          return (
            <div key={key} className="chart-tooltip-row">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                {isNet ? "Net" : isIn ? "Income" : "Expenses"}
              </span>
              <span style={{ color: entry.color }}>
                {isNet && Number(entry.value) >= 0 ? "+" : ""}
                {money(Number(entry.value ?? 0))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
