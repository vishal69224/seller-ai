import { cn } from "@/lib/utils"

type SampleDataBadgeProps = {
  className?: string
}

/** Marks UI sections that use mock / illustrative data for the portfolio demo. */
export function SampleDataBadge({ className }: SampleDataBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300",
        className
      )}
    >
      Sample data
    </span>
  )
}
