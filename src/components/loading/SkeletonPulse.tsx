import { cn } from "../../utils/cn";

/**
 * One shimmering placeholder block.
 *
 * Deliberately reuses the real cards' border/background tokens so a skeleton
 * reads as "the app, still loading" instead of an error or an empty state.
 */
export default function SkeletonPulse({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-xl bg-white/[0.06]", className)} />;
}