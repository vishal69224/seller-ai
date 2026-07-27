import { Link2, RefreshCw } from "lucide-react"
import type { ConnectionStatus, Marketplace } from "@/data/marketplaces"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  ConnectionStatus,
  { label: string; className: string; dot: string }
> = {
  connected: {
    label: "Connected",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  disconnected: {
    label: "Not Connected",
    className:
      "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/50",
  },
  pending: {
    label: "Pending",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
}

type MarketplaceCardProps = {
  marketplace: Marketplace
  onConnect: (marketplace: Marketplace) => void
}

export function MarketplaceCard({ marketplace, onConnect }: MarketplaceCardProps) {
  const status = statusConfig[marketplace.status]
  const isConnected = marketplace.status === "connected"

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold shadow-sm ring-1 ring-black/5 dark:ring-white/10",
              marketplace.logoBg,
              marketplace.brandColor
            )}
            aria-hidden
          >
            {marketplace.initials}
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              status.className
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            {marketplace.name}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {marketplace.description}
          </p>
        </div>

        <Button
          className="mt-auto w-full"
          variant={isConnected ? "outline" : "default"}
          onClick={() => onConnect(marketplace)}
        >
          {isConnected ? (
            <>
              <RefreshCw />
              Manage Connection
            </>
          ) : (
            <>
              <Link2 />
              Connect
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
