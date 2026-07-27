import {
  Package,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Store,
  Upload,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    title: "New order received",
    detail: "Order #ORD-4821 from Amazon — $128.50",
    time: "2 min ago",
    icon: ShoppingCart,
    tone: "text-sky-600 bg-sky-500/10",
  },
  {
    id: 2,
    title: "Product synced",
    detail: "Wireless Earbuds Pro updated on eBay",
    time: "18 min ago",
    icon: Package,
    tone: "text-teal-600 bg-teal-500/10",
  },
  {
    id: 3,
    title: "Marketplace connected",
    detail: "Walmart seller account linked successfully",
    time: "1 hr ago",
    icon: Store,
    tone: "text-violet-600 bg-violet-500/10",
  },
  {
    id: 4,
    title: "Bulk upload completed",
    detail: "142 products imported from CSV",
    time: "3 hrs ago",
    icon: Upload,
    tone: "text-amber-600 bg-amber-500/10",
  },
  {
    id: 5,
    title: "Inventory alert",
    detail: "Low stock: Canvas Tote Bag (8 units left)",
    time: "5 hrs ago",
    icon: AlertTriangle,
    tone: "text-orange-600 bg-orange-500/10",
  },
  {
    id: 6,
    title: "Order fulfilled",
    detail: "Order #ORD-4798 marked as shipped",
    time: "Yesterday",
    icon: CheckCircle2,
    tone: "text-emerald-600 bg-emerald-500/10",
  },
]

export function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across your marketplaces</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {activities.map((item, index) => {
            const Icon = item.icon
            return (
              <li
                key={item.id}
                className={cn(
                  "flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50",
                  index !== activities.length - 1 && "border-b border-border/50"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    item.tone
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <span className="text-muted-foreground shrink-0 text-[11px]">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {item.detail}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
