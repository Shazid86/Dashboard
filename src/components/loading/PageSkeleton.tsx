import SkeletonPulse from "./SkeletonPulse";

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
      <SkeletonPulse className="h-3 w-24" />
      <SkeletonPulse className="mt-3 h-7 w-32" />
      <SkeletonPulse className="mt-4 h-8 w-full" />
    </div>
  );
}

/**
 * Generic loading boundary for tabs without a bespoke skeleton.
 * Mirrors the shared page rhythm: one hero card + a 3-up stat grid.
 */
export default function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      <span className="sr-only">Loading…</span>

      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8">
        <SkeletonPulse className="h-4 w-40" />
        <SkeletonPulse className="mt-4 h-10 w-64" />
        <SkeletonPulse className="mt-4 h-4 w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}