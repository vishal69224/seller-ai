import { useMemo, useState } from "react"
import { X } from "lucide-react"
import {
  uploadHistory,
  uploadMarketplaces,
  uploadStatuses,
  uploadDateFilters,
  matchesDateFilter,
  type UploadStatus,
} from "@/data/upload-history"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statusMap: Record<string, UploadStatus | "all"> = {
  "All Statuses": "all",
  Success: "success",
  Failed: "failed",
  Pending: "pending",
}

const statusBadge: Record<
  UploadStatus,
  { label: string; variant: "success" | "destructive" | "warning" }
> = {
  success: { label: "Success", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  pending: { label: "Pending", variant: "warning" },
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function UploadHistoryPage() {
  const [marketplace, setMarketplace] = useState("All Marketplaces")
  const [dateFilter, setDateFilter] = useState("All Dates")
  const [status, setStatus] = useState("All Statuses")

  const filtered = useMemo(() => {
    const statusKey = statusMap[status] ?? "all"
    return uploadHistory.filter((row) => {
      const matchesMarketplace =
        marketplace === "All Marketplaces" || row.marketplace === marketplace
      const matchesStatus = statusKey === "all" || row.status === statusKey
      const matchesDate = matchesDateFilter(row.uploadDate, dateFilter)
      return matchesMarketplace && matchesStatus && matchesDate
    })
  }, [marketplace, dateFilter, status])

  const hasFilters =
    marketplace !== "All Marketplaces" ||
    dateFilter !== "All Dates" ||
    status !== "All Statuses"

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Upload History
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track product uploads and sync results across marketplaces.
        </p>
      </div>

      <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center">
        <Select value={marketplace} onValueChange={setMarketplace}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Marketplace" />
          </SelectTrigger>
          <SelectContent>
            {uploadMarketplaces.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            {uploadDateFilters.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {uploadStatuses.map((item) => (
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
              setMarketplace("All Marketplaces")
              setDateFilter("All Dates")
              setStatus("All Statuses")
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-sm">
        Showing{" "}
        <span className="text-foreground font-semibold">{filtered.length}</span>{" "}
        uploads
      </p>

      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="bg-muted/40 border-b text-xs tracking-wide uppercase">
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Product
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Marketplace
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Upload Date
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 font-semibold">
                  Error Message
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground px-4 py-12 text-center"
                  >
                    No upload records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const badge = statusBadge[row.status]
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-muted/30 border-b last:border-0 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{row.product}</p>
                        <p className="text-muted-foreground text-xs">{row.sku}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.marketplace}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(row.uploadDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="text-muted-foreground max-w-xs px-4 py-3 text-xs">
                        {row.errorMessage ?? "—"}
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
