import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, Plug, Save } from "lucide-react"
import type { Marketplace } from "@/data/marketplaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api, ApiError } from "@/lib/api"
import { mapApiMarketplace } from "@/lib/mappers"

type ConnectModalProps = {
  marketplace: Marketplace | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (marketplace: Marketplace) => void
}

export function ConnectModal({
  marketplace,
  open,
  onOpenChange,
  onSaved,
}: ConnectModalProps) {
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [merchantId, setMerchantId] = useState("")
  const [sellerId, setSellerId] = useState("")
  const [testState, setTestState] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [testMessage, setTestMessage] = useState("")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [error, setError] = useState("")

  useEffect(() => {
    if (marketplace && open) {
      setClientId(marketplace.credentials.clientId)
      setClientSecret(marketplace.credentials.clientSecret)
      setMerchantId(marketplace.credentials.merchantId)
      setSellerId(marketplace.credentials.sellerId)
      setTestState("idle")
      setTestMessage("")
      setSaveState("idle")
      setError("")
    }
  }, [marketplace, open])

  const credentialsPayload = () => ({
    client_id: clientId,
    client_secret: clientSecret,
    merchant_id: merchantId,
    seller_id: sellerId,
  })

  const handleTest = async () => {
    if (!marketplace) return
    setTestState("testing")
    setTestMessage("")
    setError("")
    try {
      const result = await api.testMarketplace({
        marketplace_id: marketplace.id,
        credentials: credentialsPayload(),
      })
      setTestState(result.success ? "success" : "error")
      setTestMessage(result.message)
    } catch (err) {
      setTestState("error")
      setTestMessage(
        err instanceof ApiError ? err.detail : "Connection test failed"
      )
    }
  }

  const handleSave = async () => {
    if (!marketplace) return
    setSaveState("saving")
    setError("")
    try {
      const saved = await api.connectMarketplace({
        marketplace_id: marketplace.id,
        status: "connected",
        credentials: credentialsPayload(),
      })
      setSaveState("saved")
      onSaved(mapApiMarketplace(saved))
      window.setTimeout(() => {
        onOpenChange(false)
      }, 500)
    } catch (err) {
      setSaveState("idle")
      setError(err instanceof ApiError ? err.detail : "Failed to save connection")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Connect {marketplace?.name ?? "Marketplace"}
          </DialogTitle>
          <DialogDescription>
            Enter your API credentials to link this marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="client-id">Client ID</Label>
            <Input
              id="client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter client ID"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client-secret">Client Secret</Label>
            <Input
              id="client-secret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter client secret"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="merchant-id">Merchant ID</Label>
            <Input
              id="merchant-id"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="Enter merchant ID"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="seller-id">Seller ID</Label>
            <Input
              id="seller-id"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              placeholder="Enter seller ID"
              autoComplete="off"
            />
          </div>

          {testState === "success" && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {testMessage || "Connection test successful"}
            </div>
          )}
          {(testState === "error" || error) && (
            <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm">
              {error || testMessage || "Connection test failed. Check your credentials."}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleTest()}
            disabled={testState === "testing" || saveState === "saving"}
          >
            {testState === "testing" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plug />
            )}
            Test Connection
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saveState === "saving" || saveState === "saved"}
          >
            {saveState === "saving" ? (
              <Loader2 className="animate-spin" />
            ) : saveState === "saved" ? (
              <CheckCircle2 />
            ) : (
              <Save />
            )}
            {saveState === "saved" ? "Saved" : "Save Connection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
