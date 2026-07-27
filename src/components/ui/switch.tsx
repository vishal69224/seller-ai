import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function Switch({
  className,
  checked,
  onCheckedChange,
  id,
  ...props
}: Omit<ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "focus-visible:ring-ring inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "bg-background pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

export { Switch }
