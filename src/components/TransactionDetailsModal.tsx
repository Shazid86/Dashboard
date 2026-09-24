import Modal from "./Modal";
import { formatCurrency, formatDate } from "../lib/format";
import { cn } from "../utils/cn";
import type { Transaction } from "../types";

interface Props {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
  currency: string;
}

function MetaRow({
  label,
  value,
  mono,
  muted,
}: {
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5 last:border-b-0">
      <span className="shrink-0 text-sm font-bold text-white/45">{label}</span>

      <span
        className={cn(
          "min-w-0 text-right text-sm font-semibold text-white/90",
          mono && "break-all font-mono text-xs text-white/60",
          muted && "font-normal text-white/60"
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * ============================================================
 * TRANSACTION DETAILS MODAL
 * ============================================================
 *
 * shadcn-style details dialog: prominent dark amount card,
 * key-value metadata list (Category / Date / Notes / ID) and
 * a full-width "Close Details" footer — parity with the
 * marketing page's transaction details sheet.
 * ============================================================
 */

export default function TransactionDetailsModal({ transaction, open, onClose, currency }: Props) {
  return (
    <Modal
      open={open && transaction !== null}
      onClose={onClose}
      title={transaction?.description ?? ""}
      subtitle="Complete information about this transaction."
    >
      {transaction && (
        <div className="space-y-5">
          {/* AMOUNT CARD */}

          <div className="rounded-2xl border border-white/[0.08] bg-ink-950/80 p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">Amount</p>

            <p className="mt-2 font-display text-3xl font-bold text-white">
              {formatCurrency(transaction.amount, currency)}
            </p>
          </div>

          {/* METADATA */}

          <div>
            <MetaRow label="Category" value={transaction.category} />

            <MetaRow label="Date" value={formatDate(transaction.date)} />

            <MetaRow
              label="Notes"
              value={
                transaction.notes?.trim()
                  ? transaction.notes
                  : "No notes were added to this transaction."
              }
              muted
            />

            <MetaRow label="Transaction ID" value={`#${transaction.id}`} mono />
          </div>

          {/* FOOTER */}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.1] hover:text-white"
          >
            Close Details
          </button>
        </div>
      )}
    </Modal>
  );
}