import { useState } from "react";
import { RefreshCw, WifiOff, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Service-worker registration + non-blocking update prompt.
 *
 * Mount only in production (see App.tsx): there is no service worker to talk
 * to during `vite dev`.
 *
 * Why a banner and not `registerType: "autoUpdate"`: an automatic reload can
 * land while the user is mid-form or mid-export and silently discard their
 * input. The new worker therefore WAITS, and the refresh is offered as an
 * explicit, dismissible action instead.
 *
 * A refresh keeps the origin's storage intact, so the Supabase session in
 * localStorage and the `aureus.dashboard.v1` data blob both survive it —
 * this component never calls signOut() and never touches storage keys.
 */
export default function PwaUpdateBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
    immediate: true,
  });
  const [updateReady] = needRefresh;
  const [isOfflineReady] = offlineReady;

  if (dismissed) return null;

  if (updateReady) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-5 left-4 z-[94] w-[min(22rem,calc(100vw-2rem))]"
      >
        <div className="glass-panel flex items-start gap-3 rounded-2xl border border-gold-400/30 bg-ink-900/95 p-3.5 shadow-2xl">
          <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white/90">A new version is ready</p>
            <p className="mt-0.5 text-xs text-white/45">
              Refresh to update — your data and your sign-in stay exactly as they are.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => void updateServiceWorker(true)}
                className="gold-btn rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                Refresh now
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 transition hover:text-white"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss update prompt"
            className="rounded-md p-1 text-white/30 transition hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (isOfflineReady) {
    return (
      <div role="status" aria-live="polite" className="fixed bottom-5 left-4 z-[94] w-[min(22rem,calc(100vw-2rem))]">
        <div className="glass-panel flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-ink-900/95 p-3.5 shadow-2xl">
          <WifiOff className="h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.75} />
          <p className="min-w-0 flex-1 text-sm text-white/85">Aureus is ready to work offline.</p>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss notification"
            className="rounded-md p-1 text-white/30 transition hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}