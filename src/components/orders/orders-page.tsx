import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import {
  orders,
  orderMarketplaces,
  paymentStatuses,
  deliveryStatuses,
  formatAmount,
  type PaymentStatus,
  type DeliveryStatus,
} from "@/data/orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SampleDataBadge } from "@/components/ui/sample-data-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const paymentMap: Record<string, PaymentStatus | "all"> = {
  "All Payments": "all",
  Paid: "paid",
  Pending: "pending",
  Failed: "failed",
  Refunded: "refunded",
}

const deliveryMap: Record<string, DeliveryStatus | "all"> = {
  "All Delivery": "all",
  Delivered: "delivered",
  Shipped: "shipped",
  Processing: "processing",
  Cancelled: "cancelled",
}

const paymentBadge: Record<
  PaymentStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "muted" }
> = {
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  failed: { label: "Failed", variant: "destructive" },
  refunded: { label: "Refunded", variant: "muted" },
}

const deliveryBadge: Record<
  DeliveryStatus,
  { label: string; variant: "success" | "default" | "warning" | "destructive" }
> = {
  delivered: { label: "Delivered", variant: "success" },
  shipped: { label: "Shipped", variant: "default" },
  processing: { label: "Processing", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function OrdersPage() {
  const [search, setSearch] = useState("")
  const [marketplace, setMarketplace] = useState("All Marketplaces")
  const [payment, setPayment] = useState("All Payments")
  const [delivery, setDelivery] = useState("All Delivery")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const paymentKey = paymentMap[payment] ?? "all"
    const deliveryKey = deliveryMap[delivery] ?? "all"

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.marketplace.toLowerCase().includes(query)

      const matchesMarketplace =
        marketplace === "All Marketplaces" || order.marketplace === marketplace
      const matchesPayment =
        paymentKey === "all" || order.paymentStatus === paymentKey
      const matchesDelivery =
        deliveryKey === "all" || order.deliveryStatus === deliveryKey

      return (
        matchesSearch &&
        matchesMarketplace &&
        matchesPayment &&
        matchesDelivery
      )
    })
  }, [search, marketplace, payment, delivery])

  const hasFilters =
    search.trim() !== "" ||
    marketplace !== "All Marketplaces" ||
    payment !== "All Payments" ||
    delivery !== "All Delivery"

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Orders
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            UI demo for filtering payments and delivery across channels.
          </p>
        </div>
        <SampleDataBadge className="self-start" />
      </div>

      <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer, or marketplace…"
            className="bg-muted/30 border-transparent pl-9 focus-visible:border-input focus-visible:bg-background"
          />
        </div>

        <Select value={marketplace} onValueChange={setMarketplace}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Marketplace" />
          </SelectTrigger>
          <SelectContent>
            {orderMarketplaces.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger className="w-full lg:w-36">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            {paymentStatuses.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={delivery} onValueChange={setDelivery}>
          <SelectTrigger className="w-full lg:w-36">
            <SelectValue placeholder="Delivery" />
          </SelectTrigger>
          <SelectContent>
            {deliveryStatuses.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setSearch("")
              setMarketplace("All Marketplaces")
              setPayment("All Payments")
              setDelivery("All Delivery")
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-sm">
        Showing{" "}
        <span className="text-foreground font-semibold">{filtered.length}</span> of{" "}
        <span className="text-foreground font-semibold">{orders.length}</span>{" "}
        orders
      </p>

      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="bg-muted/40 border-b text-xs tracking-wide uppercase">
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Order ID
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Customer
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Marketplace
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Amount
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Payment Status
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Delivery Status
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-muted-foreground px-4 py-12 text-center"
                  >
                    No orders match your search or filters.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const pay = paymentBadge[order.paymentStatus]
                  const del = deliveryBadge[order.deliveryStatus]
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/30 border-b last:border-0 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-4 py-3">{order.customer}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {order.marketplace}
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {formatAmount(order.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={pay.variant}>{pay.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={del.variant}>{del.label}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(order.date)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
