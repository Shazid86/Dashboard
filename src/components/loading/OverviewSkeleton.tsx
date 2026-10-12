import SkeletonPulse from "./SkeletonPulse";

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
      <div className="flex items-center justify-between gap-2">
        <SkeletonPulse className="h-3 w-24" />
        <SkeletonPulse className="h-8 w-8 rounded-xl" />
      </div>
      <SkeletonPulse className="mt-3 h-7 w-32" />
      <SkeletonPulse className="mt-3 h-8 w-full" />
    </div>
  );
}

/**
 * Loading boundary for the Overview tab.
 *
 * Shape intentionally mirrors the real layout (hero TiltCard → 3-up KPI grid →
 * cash-flow card → recent-transactions card) so the swap to real content does
 * not jump. Rendered only while `hydrated === false`, which is what guarantees
 * "No expense data yet" / "No transactions yet" can never flash first.
 */
export default function OverviewSkeleton() {
  return (
    <div role="status" aria-label="Loading overview" className="space-y-4">
      <span className="sr-only">Loading overview…</span>

      {/* Hero — net worth + income/expense split */}
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <SkeletonPulse className="h-3 w-32" />
            <SkeletonPulse className="mt-3 h-11 w-56" />
            <SkeletonPulse className="mt-3 h-4 w-full max-w-md" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <SkeletonPulse className="h-3 w-16" />
              <SkeletonPulse className="mt-2 h-6 w-28" />
            </div>
            <div className="min-w-0 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <SkeletonPulse className="h-3 w-16" />
              <SkeletonPulse className="mt-2 h-6 w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>

      {/* Cash flow */}
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SkeletonPulse className="h-4 w-40" />
          <SkeletonPulse className="h-7 w-48 rounded-xl" />
        </div>
        <SkeletonPulse className="mt-5 h-56 w-full" />
      </div>

      {/* Recent transactions + budgets */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] p-6">
            <SkeletonPulse className="h-4 w-44" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center justify-between gap-4 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <SkeletonPulse className="h-9 w-9 rounded-xl" />
                    <div className="min-w-0">
                      <SkeletonPulse className="h-3.5 w-40" />
                      <SkeletonPulse className="mt-2 h-3 w-28" />
                    </div>
                  </div>
                  <SkeletonPulse className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] p-6">
          <SkeletonPulse className="h-4 w-32" />
          <div className="mt-4 space-y-4">
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}