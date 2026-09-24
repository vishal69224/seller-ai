import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Package, ShoppingCart, Layers, Store } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { SampleDataBadge } from "@/components/ui/sample-data-badge"
import { Button } from "@/components/ui/button"
import { api, type ApiProduct } from "@/lib/api"
import { formatPrice } from "@/data/products"

type DashboardStats = {
  products: number
  active: number
  lowStock: number
  connected: number
  catalogValue: number
}

const emptyStats: DashboardStats = {
  products: 0,
  active: 0,
  lowStock: 0,
  connected: 0,
  catalogValue: 0,
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [products, marketplaces] = await Promise.all([
          api.listProducts(),
          api.listMarketplaces(),
        ])
        if (cancelled) return
        setStats(
          computeStats(
            products,
            marketplaces.filter((m) => m.status === "connected").length
          )
        )
      } catch {
        if (!cancelled) setStats(emptyStats)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const cards = [
    {
      title: "Total Products",
      value: loading ? "…" : String(stats.products),
      change: loading ? "…" : `${stats.active} active`,
      trend: "up" as const,
      icon: Package,
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-600 dark:text-teal-400",
      glow: "bg-teal-400",
    },
    {
      title: "Catalog value",
      value: loading ? "…" : formatPrice(stats.catalogValue),
      change: "From live inventory",
      trend: "up" as const,
      icon: Layers,
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
      glow: "bg-sky-400",
    },
    {
      title: "Low stock",
      value: loading ? "…" : String(stats.lowStock),
      change: "Stock ≤ 20 units",
      trend: stats.lowStock > 0 ? ("down" as const) : ("up" as const),
      icon: ShoppingCart,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      glow: "bg-amber-400",
    },
    {
      title: "Connected stores",
      value: loading ? "…" : String(stats.connected),
      change: "Live marketplace links",
      trend: "up" as const,
      icon: Store,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      glow: "bg-emerald-400",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Live catalog stats from your Seller Hub API — sample charts below.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/products">View products</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/video-generator">Generate video</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <SampleDataBadge />
        <p className="text-muted-foreground text-xs">
          Sales overview and activity feed are illustrative for the portfolio
          demo.
        </p>
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

function computeStats(products: ApiProduct[], connected: number): DashboardStats {
  return {
    products: products.length,
    active: products.filter((p) => p.status === "active").length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 20).length,
    connected,
    catalogValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  }
}
