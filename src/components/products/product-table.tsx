import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import type { Product, ProductStatus } from "@/data/products"
import { formatPrice } from "@/data/products"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const statusBadge: Record<
  ProductStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "muted" }
> = {
  active: { label: "Active", variant: "success" },
  draft: { label: "Draft", variant: "warning" },
  out_of_stock: { label: "Out of Stock", variant: "destructive" },
  archived: { label: "Archived", variant: "muted" },
}

type ProductTableProps = {
  products: Product[]
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductTable({
  products,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-card flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="font-display text-base font-semibold">No products found</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="bg-muted/40 border-b text-xs tracking-wide uppercase">
              <th className="text-muted-foreground px-4 py-3 font-semibold">
                Product
              </th>
              <th className="text-muted-foreground px-4 py-3 font-semibold">
                Price
              </th>
              <th className="text-muted-foreground px-4 py-3 font-semibold">
                Stock
              </th>
              <th className="text-muted-foreground px-4 py-3 font-semibold">
                Channel
              </th>
              <th className="text-muted-foreground px-4 py-3 font-semibold">
                Status
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const status = statusBadge[product.status]
              return (
                <tr
                  key={product.id}
                  className="hover:bg-muted/30 border-b last:border-0 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                          product.imageColor
                        )}
                        aria-hidden
                      >
                        {product.imageInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {product.sku} · {product.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={cn(
                        product.stock === 0 && "text-rose-600 dark:text-rose-400",
                        product.stock > 0 && product.stock < 20 && "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {product.marketplace}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden h-8 w-8 sm:inline-flex"
                        onClick={() => onView(product)}
                        aria-label={`View ${product.name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden h-8 w-8 sm:inline-flex"
                        onClick={() => onEdit(product)}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hidden h-8 w-8 sm:inline-flex"
                        onClick={() => onDelete(product)}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:hidden"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(product)}>
                            <Eye />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(product)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
