import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  PackageX,
  Save,
  Trash2,
} from "lucide-react"
import { productCategories, type Product } from "@/data/products"
import {
  ImageUploadZone,
  type PreviewImage,
} from "@/components/products/image-upload-zone"
import { DeleteProductDialog } from "@/components/products/product-dialogs"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { api, ApiError, fileToDataUrl } from "@/lib/api"
import { mapApiProduct } from "@/lib/mappers"

const categories = productCategories.filter((c) => c !== "All Categories")

export function EditProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("")
  const [images, setImages] = useState<PreviewImage[]>([])
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const imagesRef = useRef(images)
  imagesRef.current = images

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = mapApiProduct(await api.getProduct(productId))
      setProduct(data)
      setName(data.name)
      setDescription(data.description)
      setPrice(String(data.price))
      setStock(String(data.stock))
      setCategory(data.category)
      setImages(
        data.images.map((url, index) => ({
          id: `${data.id}-img-${index}`,
          url,
          name: `${data.imageInitials}-${index + 1}.png`,
        }))
      )
      setNotFound(false)
    } catch {
      setNotFound(true)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void loadProduct()
  }, [loadProduct])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url)
      })
    }
  }, [])

  if (loading) {
    return (
      <div className="text-muted-foreground flex min-h-64 items-center justify-center text-sm">
        Loading product…
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 py-20 text-center">
        <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
          <PackageX className="text-muted-foreground h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Product not found</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            This product could not be loaded from the API.
          </p>
        </div>
        <Button asChild>
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const imageUrls: string[] = []
      for (const image of images) {
        if (image.file) {
          imageUrls.push(await fileToDataUrl(image.file))
        } else {
          imageUrls.push(image.url)
        }
      }

      const updated = await api.updateProduct(product.id, {
        name,
        description,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        category,
        images: imageUrls,
      })
      setProduct(mapApiProduct(updated))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link
            to="/products"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Edit Product
            </h1>
            <Badge variant="secondary" className="capitalize">
              {product.status.replaceAll("_", " ")}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Update listing details for{" "}
            <span className="text-foreground font-medium">{product.sku}</span> on{" "}
            {product.marketplace}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete Product
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            <Save />
            Save Changes
          </Button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Changes saved successfully.
        </div>
      )}
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Product details</CardTitle>
              <CardDescription>
                Edit name, description, pricing, stock, and category.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-36"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={category || undefined} onValueChange={setCategory}>
                  <SelectTrigger id="edit-category" className="w-full sm:max-w-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Existing images are preloaded. Add, replace, or remove as needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploadZone images={images} onChange={setImages} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-card sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-lg">
        <p className="text-muted-foreground text-xs sm:text-sm">
          Changes are saved to MongoDB through the API.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete Product
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            <Save />
            Save Changes
          </Button>
        </div>
      </div>

      <DeleteProductDialog
        product={product}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          try {
            await api.deleteProduct(product.id)
            navigate("/products")
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
