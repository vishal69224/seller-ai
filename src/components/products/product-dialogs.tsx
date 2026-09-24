import type { FormEvent } from "react"
import type { Product } from "@/data/products"
import { formatPrice } from "@/data/products"
import { Badge } from "@/components/ui/badge"
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
import { cn } from "@/lib/utils"

type ViewProductDialogProps = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewProductDialog({
  product,
  open,
  onOpenChange,
}: ViewProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            Read-only preview of the selected product.
          </DialogDescription>
        </DialogHeader>
        {product && (
          <div className="grid gap-4 py-2">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl text-sm font-bold",
                  product.imageColor
                )}
              >
                {product.imageInitials}
              </div>
              <div>
                <p className="font-display font-semibold">{product.name}</p>
                <p className="text-muted-foreground text-xs">{product.sku}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">Price</dt>
                <dd className="mt-0.5 font-medium">{formatPrice(product.price)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Stock</dt>
                <dd className="mt-0.5 font-medium">{product.stock}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Category</dt>
                <dd className="mt-0.5 font-medium">{product.category}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Channel</dt>
                <dd className="mt-0.5 font-medium">{product.marketplace}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground text-xs">Status</dt>
                <dd className="mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {product.status.replaceAll("_", " ")}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type EditProductDialogProps = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => void
  mode?: "edit" | "add"
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSave,
  mode = "edit",
}: EditProductDialogProps) {
  const isAdd = mode === "add"

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const base: Product = product ?? {
      id: `prd-${Date.now()}`,
      name: "",
      description: "",
      sku: "",
      category: "Electronics",
      price: 0,
      stock: 0,
      marketplace: "Website",
      status: "draft",
      imageColor: "bg-primary/15 text-primary",
      imageInitials: "NP",
      images: [],
    }

    onSave({
      ...base,
      name: String(form.get("name") || base.name),
      sku: String(form.get("sku") || base.sku),
      price: Number(form.get("price") || base.price),
      stock: Number(form.get("stock") || base.stock),
      category: String(form.get("category") || base.category),
      marketplace: String(form.get("marketplace") || base.marketplace),
      imageInitials: String(form.get("name") || base.name)
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0] ?? "")
        .join("")
        .toUpperCase() || base.imageInitials,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isAdd ? "Add Product" : "Edit Product"}</DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Create a new product listing with dummy data."
              : "Update product details. Changes are stored locally only."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              name="name"
              defaultValue={product?.name ?? ""}
              placeholder="e.g. Wireless Earbuds Pro"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-sku">SKU</Label>
            <Input
              id="product-sku"
              name="sku"
              defaultValue={product?.sku ?? ""}
              placeholder="e.g. EL-WEB-001"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="product-price">Price (₹)</Label>
              <Input
                id="product-price"
                name="price"
                type="number"
                min={0}
                defaultValue={product?.price ?? 999}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                name="stock"
                type="number"
                min={0}
                defaultValue={product?.stock ?? 0}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-category">Category</Label>
            <Input
              id="product-category"
              name="category"
              defaultValue={product?.category ?? "Electronics"}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-marketplace">Channel</Label>
            <Input
              id="product-marketplace"
              name="marketplace"
              defaultValue={product?.marketplace ?? "Website"}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isAdd ? "Add Product" : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type DeleteProductDialogProps = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="text-foreground font-medium">
              {product?.name ?? "this product"}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
