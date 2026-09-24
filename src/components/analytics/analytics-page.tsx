import { ArrowDownRight, ArrowUpRight, DollarSign, Package, ShoppingCart } from "lucide-react"
import {
  analyticsStats,
  marketplacePerformance,
  monthlySales,
  topProducts,
} from "@/data/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SampleDataBadge } from "@/components/ui/sample-data-badge"
import { cn } from "@/lib/utils"

function MetricCard({
  title,
  value,
  change,
  trend,
  subtitle,
  icon: Icon,
  iconClass,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  subtitle: string
  icon: typeof DollarSign
  iconClass: string
}) {
  const isUp = trend === "up"
  return (
    <Card>
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
              "flex h-10 w-10 items-center justify-center rounded-xl",
              iconClass
            )}
          >
            <Icon className="h-5 w-5" />
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
          <span className="text-muted-foreground">{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsPage() {
  const maxSales = Math.max(...monthlySales.map((m) => m.value))

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Illustrative charts for the portfolio UI — not live order data.
          </p>
        </div>
        <SampleDataBadge className="self-start" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Revenue"
          value={analyticsStats.revenue.total}
          change={analyticsStats.revenue.change}
          trend={analyticsStats.revenue.trend}
          subtitle={analyticsStats.revenue.subtitle}
          icon={DollarSign}
          iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          title="Orders"
          value={analyticsStats.orders.total}
          change={analyticsStats.orders.change}
          trend={analyticsStats.orders.trend}
          subtitle={analyticsStats.orders.subtitle}
          icon={ShoppingCart}
          iconClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
        <MetricCard
          title="Products"
          value={analyticsStats.products.total}
          change={analyticsStats.products.change}
          trend={analyticsStats.products.trend}
          subtitle={analyticsStats.products.subtitle}
          icon={Package}
          iconClass="bg-teal-500/10 text-teal-600 dark:text-teal-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>
              Dummy revenue trend across the year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex h-64 items-end gap-2 sm:gap-3">
              <div
                className="pointer-events-none absolute inset-0 flex flex-col justify-between"
                aria-hidden
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border-border/60 border-t border-dashed"
                  />
                ))}
              </div>
              {monthlySales.map((bar) => (
                <div
                  key={bar.label}
                  className="group relative z-10 flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all group-hover:to-primary/85"
                      style={{ height: `${(bar.value / maxSales) * 100}%` }}
                      title={`${bar.label}: ${bar.value}%`}
                    />
                  </div>
                  <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Marketplace Performance</CardTitle>
            <CardDescription>Share of total revenue by channel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketplacePerformance.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.value}%</span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className={cn("h-full rounded-full", item.color)}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>
            Best-performing SKUs by sales volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs tracking-wide uppercase">
                  <th className="text-muted-foreground pb-3 font-semibold">
                    Rank
                  </th>
                  <th className="text-muted-foreground pb-3 font-semibold">
                    Product
                  </th>
                  <th className="text-muted-foreground pb-3 font-semibold">
                    Units Sold
                  </th>
                  <th className="text-muted-foreground pb-3 text-right font-semibold">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr
                    key={product.name}
                    className="border-b last:border-0"
                  >
                    <td className="py-3">
                      <span className="bg-muted inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{product.name}</td>
                    <td className="py-3">{product.sales.toLocaleString("en-IN")}</td>
                    <td className="py-3 text-right font-semibold">
                      {product.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
