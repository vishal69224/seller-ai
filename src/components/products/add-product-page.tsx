import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Upload,
} from "lucide-react"
import { productCategories } from "@/data/products"
import {
  ImageUploadZone,
  type PreviewImage,
} from "@/components/products/image-upload-zone"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { api, ApiError, fileToDataUrl } from "@/lib/api"

const categories = productCategories.filter((c) => c !== "All Categories")

const brands = [
  "NovaWear",
  "Aether Home",
  "PulseTech",
  "Bloom Beauty",
  "TrailForge",
  "UrbanNest",
  "Other",
]

type Feedback = {
  type: "draft" | "publish" | "error"
  message: string
} | null

export function AddProductPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("Wireless Earbuds Pro")
  const [description, setDescription] = useState(
    "Premium true wireless earbuds with active noise cancellation, 32-hour battery life, and IPX5 water resistance. Includes charging case and three ear tip sizes."
  )
  const [price, setPrice] = useState("2499")
  const [discount, setDiscount] = useState("10")
  const [category, setCategory] = useState("Electronics")
  const [brand, setBrand] = useState("PulseTech")
  const [stock, setStock] = useState("150")
  const [sku, setSku] = useState("EL-WEB-001")
  const [weight, setWeight] = useState("0.18")
  const [length, setLength] = useState("12")
  const [width, setWidth] = useState("8")
  const [height, setHeight] = useState("4")
  const [images, setImages] = useState<PreviewImage[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const imagesRef = useRef(images)
  imagesRef.current = images

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url)
      })
    }
  }, [])

  const discountedPrice = useMemo(() => {
    if (!price) return null
    const base = Number(price)
    const off = Number(discount) || 0
    if (Number.isNaN(base)) return null
    return Math.max(0, base - (base * off) / 100)
  }, [price, discount])

  const buildPayload = async (status: "draft" | "active") => {
    const imageUrls: string[] = []
    for (const image of images) {
      if (image.file) {
        imageUrls.push(await fileToDataUrl(image.file))
      } else if (
        image.url.startsWith("data:") ||
        image.url.startsWith("http")
      ) {
        imageUrls.push(image.url)
      }
    }

    return {
      name: name.trim() || "Untitled Product",
      description,
      sku: sku.trim() || `SKU-${Date.now()}`,
      category: category || "Electronics",
      brand: brand || null,
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      stock: Number(stock) || 0,
      marketplace: "Website",
      marketplaces: ["website"],
      status,
      images: imageUrls,
      weight: weight === "" ? null : Number(weight),
      length: length === "" ? null : Number(length),
      width: width === "" ? null : Number(width),
      height: height === "" ? null : Number(height),
    }
  }

  const handleSaveDraft = async () => {
    setFeedback(null)
    setSaving(true)
    try {
      await api.createProduct(await buildPayload("draft"))
      setFeedback({
        type: "draft",
        message: "Draft saved successfully.",
      })
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Failed to save draft",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!name.trim()) {
      setFeedback({ type: "error", message: "Product name is required." })
      return
    }

    setFeedback(null)
    setSaving(true)
    try {
      await api.createProduct(await buildPayload("active"))
      setFeedback({
        type: "publish",
        message: "Product published to your website.",
      })
      window.setTimeout(() => navigate("/products"), 900)
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiError ? err.detail : "Failed to publish product",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-28">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link
            to="/products"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Add Product
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Create a listing to upload on your website.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => void handleSaveDraft()}
          >
            {saving ? <Loader2 className="animate-spin" /> : <FileText />}
            Save Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => setPreviewOpen(true)}
          >
            <Eye />
            Preview
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void handlePublish()}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Upload />}
            Publish Product
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={
            feedback.type === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
              : "flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
          }
        >
          {feedback.type !== "error" && (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Product information</CardTitle>
              <CardDescription>
                Core catalog details shown on your website.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-price">Price (₹)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-discount">Discount (%)</Label>
                  <Input
                    id="product-discount"
                    type="number"
                    min={0}
                    max={100}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-brand">Brand</Label>
                  <Select value={brand || undefined} onValueChange={setBrand}>
                    <SelectTrigger id="product-brand" className="w-full">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select
                    value={category || undefined}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger id="product-category" className="w-full">
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
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-sku">SKU</Label>
                  <Input
                    id="product-sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-stock">Stock</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-weight">Weight (kg)</Label>
                  <Input
                    id="product-weight"
                    type="number"
                    min={0}
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      aria-label="Length"
                      placeholder="L"
                      type="number"
                      min={0}
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                    <Input
                      aria-label="Width"
                      placeholder="W"
                      type="number"
                      min={0}
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                    />
                    <Input
                      aria-label="Height"
                      placeholder="H"
                      type="number"
                      min={0}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Product images</CardTitle>
              <CardDescription>
                Upload multiple images. Drag to reorder — first image is the
                cover.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploadZone images={images} onChange={setImages} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Publish to website</CardTitle>
              <CardDescription>
                Products are saved to your catalog and shown on your store.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              No Meesho, Amazon, or other marketplace connection is required.
              Publish uploads the listing to your own website catalog.
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Quick glance before you publish.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium">{sku || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Stock</span>
                <span className="font-medium">{stock || "0"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Images</span>
                <span className="font-medium">{images.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Channel</span>
                <span className="font-medium">Website</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">
                  {length || "0"}×{width || "0"}×{height || "0"} cm ·{" "}
                  {weight || "0"} kg
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-card/95 sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-lg backdrop-blur">
        <p className="text-muted-foreground text-xs sm:text-sm">
          Saves to your website catalog through the API.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => void handleSaveDraft()}
          >
            {saving ? <Loader2 className="animate-spin" /> : <FileText />}
            Save Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => setPreviewOpen(true)}
          >
            <Eye />
            Preview
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void handlePublish()}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Upload />}
            Publish Product
          </Button>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Product preview</DialogTitle>
            <DialogDescription>
              How this listing will look before publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="bg-muted flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border">
              {images[0] ? (
                <img
                  src={images[0].url}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <p className="text-muted-foreground text-sm">No cover image</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                {brand} · {category}
              </p>
              <h3 className="font-display mt-1 text-xl font-semibold">
                {name || "Untitled product"}
              </h3>
              <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">
                {description || "No description yet."}
              </p>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-2xl font-bold">
                  ₹
                  {Math.round(
                    discountedPrice ?? (Number(price) || 0)
                  ).toLocaleString("en-IN")}
                </p>
                {Number(discount) > 0 && (
                  <p className="text-muted-foreground text-xs line-through">
                    ₹{Number(price || 0).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
              <p className="text-muted-foreground text-xs">Website listing</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button
              disabled={saving}
              onClick={() => {
                setPreviewOpen(false)
                void handlePublish()
              }}
            >
              {saving ? <Loader2 className="animate-spin" /> : null}
              Publish Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
