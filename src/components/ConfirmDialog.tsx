import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Delete this item?",
  message = "Are you sure you want to delete this? This action cannot be undone.",
  confirmLabel = "Delete",
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle="Destructive action">
      <div className="flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.05] p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <p className="text-sm leading-relaxed text-white/60">{message}</p>
      </div>
      <div className="mt-5 flex gap-2.5">
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-95"
        >
          {confirmLabel}
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/5"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}