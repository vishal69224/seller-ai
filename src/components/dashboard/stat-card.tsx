import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: LucideIcon
  iconBg: string
  iconColor: string
  glow: string
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
  glow,
}: StatCardProps) {
  const isUp = trend === "up"

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <div
        className={cn(
          "pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-40",
          glow
        )}
      />
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
              isUp
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {isUp ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {change}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
