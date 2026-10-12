import SkeletonPulse from "./SkeletonPulse";

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
      <SkeletonPulse className="h-3 w-28" />
      <SkeletonPulse className="mt-3 h-7 w-36" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <SkeletonPulse className="h-8 w-8 rounded-xl" />
        <div className="min-w-0">
          <SkeletonPulse className="h-3.5 w-44" />
          <SkeletonPulse className="mt-2 h-3 w-32" />
        </div>
      </div>
      <SkeletonPulse className="h-4 w-24" />
    </div>
  );
}

/**
 * Loading boundary for the Transactions tab.
 *
 * Mirrors the real layout (3 stat cards → search/filter toolbar → table) and
 * is shown instead of the table until `hydrated === false` clears, so
 * "No transactions yet" / "No transactions match your filters" can never be
 * rendered from a half-resolved store.
 */
export default function TransactionsSkeleton() {
  return (
    <div role="status" aria-label="Loading transactions" className="space-y-4">
      <span className="sr-only">Loading transactions…</span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] p-6">
        {/* Section header */}
        <SkeletonPulse className="h-4 w-52" />

        {/* Toolbar: search + filter pills + export trigger */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SkeletonPulse className="h-10 w-full sm:w-72" />
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-10 w-44 rounded-xl" />
            <SkeletonPulse className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Table header + rows, deliberately wrapped in an overflow container
            so the skeleton proves the same scroll behaviour as the real table */}
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[600px] space-y-2">
            <SkeletonPulse className="h-6 w-full" />
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <RowSkeleton key={row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}