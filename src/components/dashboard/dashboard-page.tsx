import { Package, ShoppingCart, DollarSign, Store } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SalesChart } from "@/components/dashboard/sales-chart"

const stats = [
  {
    title: "Total Products",
    value: "2,847",
    change: "12.5%",
    trend: "up" as const,
    icon: Package,
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
    glow: "bg-teal-400",
  },
  {
    title: "Total Orders",
    value: "1,204",
    change: "8.2%",
    trend: "up" as const,
    icon: ShoppingCart,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600 dark:text-sky-400",
    glow: "bg-sky-400",
  },
  {
    title: "Revenue",
    value: "$128.4k",
    change: "3.1%",
    trend: "down" as const,
    icon: DollarSign,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    glow: "bg-amber-400",
  },
  {
    title: "Connected Marketplaces",
    value: "6",
    change: "2 new",
    trend: "up" as const,
    icon: Store,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    glow: "bg-emerald-400",
  },
]

export function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome back — here&apos;s how your marketplaces are performing today.
          </p>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Last synced{" "}
          <span className="text-foreground font-medium">just now</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SalesChart />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
