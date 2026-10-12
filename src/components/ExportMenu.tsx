import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "./ui/DropdownMenu";
import { useDashboard } from "../context/DashboardContext";
import { useToast } from "../context/ToastContext";
import { buildMonthlyReport, monthKeyOf, periodLabelOf, shiftMonth } from "../lib/export/buildReport";
import { exportMonthlyPdf } from "../lib/export/toPdf";
import { exportMonthlyXlsx } from "../lib/export/toXlsx";
import { exportMonthlyDocx } from "../lib/export/toDocx";

type Format = "pdf" | "xlsx" | "docx";

/**
 * Export dropdown for the Transactions toolbar.
 *
 * Built on the existing portal-based DropdownMenu, which is deliberately
 * positioned outside the DOM subtree so it cannot be clipped by the
 * `overflow-x-auto` table wrapper (see components/ui/DropdownMenu.tsx).
 *
 * Scope is a calendar month chosen here — NOT the active search/category
 * filter — so the exported file always matches the month named on its cover.
 */
export default function ExportMenu() {
  const { transactions, accounts, currency } = useDashboard();
  const toast = useToast();
  const [month, setMonth] = useState(() => monthKeyOf());
  const [busy, setBusy] = useState<Format | null>(null);

  const run = async (format: Format) => {
    if (busy) return;

    const report = buildMonthlyReport(transactions, accounts, currency, month);

    if (report.count === 0) {
      toast.info("Nothing to export", `There are no transactions in ${report.periodLabel}.`);
      return;
    }

    setBusy(format);
    const filename = `aureus-report-${month}.${format}`;

    try {
      if (format === "pdf") {
        await exportMonthlyPdf(report, filename);
      } else if (format === "xlsx") {
        await exportMonthlyXlsx(report, filename);
      } else {
        await exportMonthlyDocx(report, filename);
      }
      toast.success("Report exported", `${report.periodLabel} · ${report.count} transactions.`);
    } catch {
      toast.error("Export failed", "Something went wrong while building the file.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <DropdownMenu
      label="Export monthly report"
      trigger={({ onToggle }) => (
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/70 transition hover:text-white"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin text-gold-300" />
          ) : (
            <Download className="h-4 w-4 text-gold-300" />
          )}
          Export
          <ChevronDown className="h-3.5 w-3.5 text-white/30" />
        </button>
      )}
    >
      <div className="px-1 pb-1.5 pt-1">
        <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
          Period
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            aria-label="Previous month"
            className="shrink-0 rounded-lg border border-white/10 p-1 text-white/50 transition hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value || monthKeyOf())}
            aria-label="Report month"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white/80 [color-scheme:dark] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            aria-label="Next month"
            className="shrink-0 rounded-lg border border-white/10 p-1 text-white/50 transition hover:text-white"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="px-1.5 pt-1 text-[10px] text-white/30">{periodLabelOf(month)}</p>
      </div>

      <DropdownMenuItem icon={FileText} onSelect={() => void run("pdf")}>
        PDF document
      </DropdownMenuItem>
      <DropdownMenuItem icon={FileSpreadsheet} onSelect={() => void run("xlsx")}>
        Excel (.xlsx)
      </DropdownMenuItem>
      <DropdownMenuItem icon={FileDown} onSelect={() => void run("docx")}>
        Word (.docx)
      </DropdownMenuItem>
    </DropdownMenu>
  );
}