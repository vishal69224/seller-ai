import { useCallback, useEffect, useMemo, useState } from "react"
import type { Marketplace } from "@/data/marketplaces"
import { MarketplaceCard } from "@/components/marketplace/marketplace-card"
import { ConnectModal } from "@/components/marketplace/connect-modal"
import { api, ApiError } from "@/lib/api"
import { mapApiMarketplace } from "@/lib/mappers"

export function MarketplacePage() {
  const [items, setItems] = useState<Marketplace[]>([])
  const [selected, setSelected] = useState<Marketplace | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadMarketplaces = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.listMarketplaces()
      setItems(data.map(mapApiMarketplace))
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "Failed to load marketplaces"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMarketplaces()
  }, [loadMarketplaces])

  const summary = useMemo(() => {
    const connected = items.filter((m) => m.status === "connected").length
    return { connected, total: items.length }
  }, [items])

  const handleConnect = (marketplace: Marketplace) => {
    setSelected(marketplace)
    setModalOpen(true)
  }

  const handleSaved = (marketplace: Marketplace) => {
    setItems((prev) =>
      prev.map((m) => (m.id === marketplace.id ? marketplace : m))
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Marketplace Connections
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Connect demo seller accounts (API-backed). Credentials are stored
            for this guest demo only — not real marketplace OAuth.
          </p>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {loading ? (
            "Loading…"
          ) : (
            <>
              <span className="text-foreground font-semibold">
                {summary.connected}
              </span>
              {" of "}
              <span className="text-foreground font-semibold">
                {summary.total}
              </span>
              {" connected"}
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((marketplace) => (
          <MarketplaceCard
            key={marketplace.id}
            marketplace={marketplace}
            onConnect={handleConnect}
          />
        ))}
      </div>

      <ConnectModal
        marketplace={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={handleSaved}
      />
    </div>
  )
}
