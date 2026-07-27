import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Search, X } from "lucide-react"
import {
  productCategories,
  productStatuses,
  type Product,
  type ProductStatus,
} from "@/data/products"
import { ProductTable } from "@/components/products/product-table"
import {
  ViewProductDialog,
  DeleteProductDialog,
} from "@/components/products/product-dialogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api, ApiError } from "@/lib/api"
import { mapApiProduct } from "@/lib/mappers"

const statusFilterMap: Record<string, ProductStatus | "all"> = {
  "All Statuses": "all",
  Active: "active",
  Draft: "draft",
  "Out of Stock": "out_of_stock",
  Archived: "archived",
}

export function ProductsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("All Categories")
  const [status, setStatus] = useState<string>("All Statuses")

  const [selected, setSelected] = useState<Product | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.listProducts()
      setItems(data.map(mapApiProduct))
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const statusKey = statusFilterMap[status] ?? "all"

    return items.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.marketplace.toLowerCase().includes(query)

      const matchesCategory =
        category === "All Categories" || product.category === category

      const matchesStatus =
        statusKey === "all" || product.status === statusKey

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [items, search, category, status])

  const hasFilters =
    search.trim() !== "" ||
    category !== "All Categories" ||
    status !== "All Statuses"

  const clearFilters = () => {
    setSearch("")
    setCategory("All Categories")
    setStatus("All Statuses")
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Products
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your catalog across all connected marketplaces.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/products/add">
            <Plus />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or marketplace…"
            className="bg-muted/30 border-transparent pl-9 focus-visible:border-input focus-visible:bg-background"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {productCategories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {productStatuses.map((item) => (
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
            onClick={clearFilters}
            className="text-muted-foreground shrink-0"
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-xs sm:text-sm">
        <p>
          {loading ? (
            "Loading products…"
          ) : (
            <>
              Showing{" "}
              <span className="text-foreground font-semibold">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="text-foreground font-semibold">{items.length}</span>{" "}
              products
            </>
          )}
        </p>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>

      <ProductTable
        products={filtered}
        onView={(product) => {
          setSelected(product)
          setViewOpen(true)
        }}
        onEdit={(product) => {
          navigate(`/products/${product.id}/edit`)
        }}
        onDelete={(product) => {
          setSelected(product)
          setDeleteOpen(true)
        }}
      />

      <ViewProductDialog
        product={selected}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

      <DeleteProductDialog
        product={selected}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (!selected) return
          try {
            await api.deleteProduct(selected.id)
            setItems((prev) => prev.filter((item) => item.id !== selected.id))
          } catch (err) {
            setError(
              err instanceof ApiError ? err.detail : "Failed to delete product"
            )
          }
        }}
      />
    </div>
  )
}
