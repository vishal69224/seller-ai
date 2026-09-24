import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  Clapperboard,
  Download,
  Film,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  api,
  ApiError,
  dataUrlToFile,
  type VideoGalleryItem,
  type VideoModel,
} from "@/lib/api"

type ImageSlot = {
  file: File
  preview: string
}

const TIER_LABELS: Record<string, string> = {
  low: "Low credit",
  mid: "Mid credit",
  high: "Higher credit",
}

const TIER_BADGE: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  mid: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  high: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
}

function ImageDropzone({
  label,
  hint,
  slot,
  onSelect,
  onClear,
}: {
  label: string
  hint: string
  slot: ImageSlot | null
  onSelect: (file: File) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (file && file.type.startsWith("image/")) onSelect(file)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-muted-foreground text-xs">{hint}</p>
        </div>
        {slot && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFile(e.dataTransfer.files[0])
        }}
        className={cn(
          "relative flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/40",
          slot && "border-solid"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {slot ? (
          <img
            src={slot.preview}
            alt={label}
            className="h-full max-h-52 w-full object-contain p-3"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="bg-muted flex h-11 w-11 items-center justify-center rounded-full">
              <ImagePlus className="text-muted-foreground h-5 w-5" />
            </div>
            <p className="text-sm font-medium">Drop product image</p>
            <p className="text-muted-foreground text-xs">
              PNG, JPG, or WebP · click to browse
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function VideoGeneratorPage() {
  const [searchParams] = useSearchParams()
  const productId = searchParams.get("productId")

  const [models, setModels] = useState<VideoModel[]>([])
  const [defaultModel, setDefaultModel] = useState("grok-imagine")
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [modelKey, setModelKey] = useState("grok-imagine")
  const [duration, setDuration] = useState("5")
  const [resolution, setResolution] = useState("720p")
  const [mode, setMode] = useState("normal")
  const [image1, setImage1] = useState<ImageSlot | null>(null)
  const [image2, setImage2] = useState<ImageSlot | null>(null)
  const [credits, setCredits] = useState<string>("—")
  const [hint, setHint] = useState("Loading…")
  const [hintError, setHintError] = useState(false)
  const [status, setStatus] = useState("")
  const [statusKind, setStatusKind] = useState<"working" | "done" | "failed" | "">("")
  const [generating, setGenerating] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [gallery, setGallery] = useState<VideoGalleryItem[]>([])
  const [loadingHealth, setLoadingHealth] = useState(true)
  const pollRef = useRef<number | null>(null)

  const currentModel = useMemo(
    () => models.find((m) => m.key === modelKey) ?? null,
    [models, modelKey]
  )

  const modelsByTier = useMemo(() => {
    const buckets: Record<string, VideoModel[]> = { low: [], mid: [], high: [] }
    for (const model of models) {
      buckets[model.cost_tier]?.push(model) ?? buckets.mid.push(model)
    }
    return buckets
  }, [models])

  const revokePreview = useCallback((slot: ImageSlot | null) => {
    if (slot?.preview.startsWith("blob:")) URL.revokeObjectURL(slot.preview)
  }, [])

  const setSlot = useCallback(
    (index: 0 | 1, file: File) => {
      const preview = URL.createObjectURL(file)
      const slot = { file, preview }
      if (index === 0) {
        revokePreview(image1)
        setImage1(slot)
      } else {
        revokePreview(image2)
        setImage2(slot)
      }
    },
    [image1, image2, revokePreview]
  )

  const clearSlot = useCallback(
    (index: 0 | 1) => {
      if (index === 0) {
        revokePreview(image1)
        setImage1(null)
      } else {
        revokePreview(image2)
        setImage2(null)
      }
    },
    [image1, image2, revokePreview]
  )

  const refreshHint = useCallback(() => {
    if (!apiKeyConfigured) {
      setHint("Add KIE_API_KEY to backend/.env to enable generation.")
      setHintError(true)
      return
    }
    if (!image1) {
      setHint("Add a product image and prompt to begin.")
      setHintError(false)
      return
    }
    if (prompt.trim().length < 3) {
      setHint("Write a prompt (at least a few words).")
      setHintError(false)
      return
    }
    const dual =
      currentModel && currentModel.max_images >= 2
        ? " Image 2 is optional for this model."
        : ""
    setHint(`Ready — credits are used only when you click Generate.${dual}`)
    setHintError(false)
  }, [apiKeyConfigured, image1, prompt, currentModel])

  const loadCredits = useCallback(async () => {
    try {
      const data = await api.videoCredits()
      setCredits(data.credits != null ? `${data.credits} credits` : "— credits")
    } catch {
      setCredits("credits unavailable")
    }
  }, [])

  const loadGallery = useCallback(async () => {
    try {
      const data = await api.videoGallery()
      setGallery(data.items ?? [])
    } catch {
      setGallery([])
    }
  }, [])

  const loadHealth = useCallback(async () => {
    setLoadingHealth(true)
    try {
      const data = await api.videoHealth()
      setModels(data.models)
      setDefaultModel(data.default_model)
      setModelKey(data.default_model)
      setPrompt(data.default_prompt)
      setApiKeyConfigured(data.api_key_configured)
      const preset = data.models.find((m) => m.key === data.default_model)
      if (preset) {
        setDuration(String(preset.default_duration))
        setResolution(preset.default_resolution)
      }
    } catch (err) {
      setHint(err instanceof ApiError ? err.detail : "Failed to load video settings")
      setHintError(true)
    } finally {
      setLoadingHealth(false)
    }
  }, [])

  const loadProductImage = useCallback(async () => {
    if (!productId) return
    try {
      const product = await api.getProduct(productId)
      const firstImage = product.images?.[0]
      if (!firstImage) return
      const file = await dataUrlToFile(firstImage, `${product.sku || "product"}-1.png`)
      setSlot(0, file)
      setPrompt((prev) => {
        if (prev.trim().length >= 3) return prev
        return `Slow cinematic orbit around ${product.name} on a clean white studio surface, soft lighting, premium e-commerce showcase.`
      })
    } catch {
      /* product preload is optional */
    }
  }, [productId, setSlot])

  useEffect(() => {
    void loadHealth()
    void loadCredits()
    void loadGallery()
  }, [loadHealth, loadCredits, loadGallery])

  useEffect(() => {
    if (!loadingHealth) void loadProductImage()
  }, [loadingHealth, loadProductImage])

  useEffect(() => {
    refreshHint()
  }, [refreshHint])

  useEffect(() => {
    if (!currentModel) return
    if (!currentModel.durations.map(String).includes(duration)) {
      setDuration(String(currentModel.default_duration))
    }
    if (!currentModel.resolutions.includes(resolution)) {
      setResolution(currentModel.default_resolution)
    }
    if (currentModel.max_images < 2) clearSlot(1)
  }, [currentModel, duration, resolution, clearSlot])

  useEffect(() => {
    return () => {
      revokePreview(image1)
      revokePreview(image2)
      if (pollRef.current) window.clearInterval(pollRef.current)
    }
  }, [image1, image2, revokePreview])

  const canGenerate =
    apiKeyConfigured && Boolean(image1) && prompt.trim().length >= 3 && !generating

  const pollTask = useCallback(
    (id: string) => {
      if (pollRef.current) window.clearInterval(pollRef.current)

      const tick = async () => {
        try {
          const data = await api.videoTaskStatus(id)
          const state = (data.state || "unknown").toLowerCase()
          setStatus(state)
          setStatusKind(
            state === "success" ? "done" : state === "fail" ? "failed" : "working"
          )

          if (state === "success") {
            if (pollRef.current) window.clearInterval(pollRef.current)
            const url = data.video_urls?.[0] ?? null
            if (!url) throw new Error("No video URL returned")
            setVideoUrl(url)
            setHint("Done — video saved locally on the server.")
            setHintError(false)
            setGenerating(false)
            void loadCredits()
            void loadGallery()
            return
          }

          if (state === "fail") {
            if (pollRef.current) window.clearInterval(pollRef.current)
            setHint(data.fail_msg || "Generation failed")
            setHintError(true)
            setGenerating(false)
          }
        } catch (err) {
          if (pollRef.current) window.clearInterval(pollRef.current)
          setStatus("error")
          setStatusKind("failed")
          setHint(err instanceof ApiError ? err.detail : "Status check failed")
          setHintError(true)
          setGenerating(false)
        }
      }

      void tick()
      pollRef.current = window.setInterval(() => void tick(), 10000)
    },
    [loadCredits, loadGallery]
  )

  const handleGenerate = async () => {
    if (!image1 || !canGenerate) return

    setGenerating(true)
    setStatus("uploading")
    setStatusKind("working")
    setHint("Starting job…")
    setHintError(false)
    setVideoUrl(null)

    const form = new FormData()
    form.append("image", image1.file)
    if (image2 && currentModel && currentModel.max_images >= 2) {
      form.append("image2", image2.file)
    }
    form.append("prompt", prompt.trim())
    form.append("model", modelKey)
    form.append("duration", duration)
    form.append("resolution", resolution)
    form.append("mode", mode)
    form.append("audio", "false")

    try {
      const data = await api.videoGenerate(form)
      setTaskId(data.task_id)
      setStatus("generating")
      setHint("This usually takes 1–3 minutes. Keep this tab open.")
      pollTask(data.task_id)
    } catch (err) {
      setStatus("failed")
      setStatusKind("failed")
      setHint(err instanceof ApiError ? err.detail : "Generate failed")
      setHintError(true)
      setGenerating(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Video Generator
            </h1>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              kie.ai
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Turn product photos into short showcase clips for listings and ads.
            Credits are charged only when you start a generation.
          </p>
          {productId && (
            <p className="text-muted-foreground text-xs">
              Preloaded from product{" "}
              <Link
                to={`/products/${productId}/edit`}
                className="text-primary font-medium hover:underline"
              >
                {productId}
              </Link>
            </p>
          )}
        </div>
        <div className="bg-card flex items-center gap-2 self-start rounded-xl border px-4 py-2.5 text-sm shadow-sm">
          <Film className="text-primary h-4 w-4" />
          <span className="text-muted-foreground">Balance:</span>
          <span className="font-medium">{credits}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Product images
              </CardTitle>
              <CardDescription>
                Upload the hero shot used for the video. Some models support an
                optional second frame.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <ImageDropzone
                label="Image 1"
                hint="Required · main product photo"
                slot={image1}
                onSelect={(file) => setSlot(0, file)}
                onClear={() => clearSlot(0)}
              />
              {currentModel && currentModel.max_images >= 2 ? (
                <ImageDropzone
                  label="Image 2"
                  hint={currentModel.second_image_label}
                  slot={image2}
                  onSelect={(file) => setSlot(1, file)}
                  onClear={() => clearSlot(1)}
                />
              ) : (
                <div className="bg-muted/30 text-muted-foreground flex min-h-44 items-center justify-center rounded-xl border border-dashed p-6 text-center text-xs">
                  Select a dual-frame model to add a second image.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prompt & model</CardTitle>
              <CardDescription>
                Describe camera motion and scene. Pick a model tier that fits your
                budget.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="video-prompt">Prompt</Label>
                <Textarea
                  id="video-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-28"
                  disabled={loadingHealth}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="video-model">Model</Label>
                <Select
                  value={modelKey}
                  onValueChange={setModelKey}
                  disabled={loadingHealth}
                >
                  <SelectTrigger id="video-model" className="w-full">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["low", "mid", "high"] as const).flatMap((tier) =>
                      (modelsByTier[tier] ?? []).map((model) => (
                        <SelectItem key={model.key} value={model.key}>
                          [{TIER_LABELS[tier]}] {model.label} · {model.cost_hint}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {currentModel && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 font-medium capitalize",
                        TIER_BADGE[currentModel.cost_tier]
                      )}
                    >
                      {currentModel.cost_tier}
                    </span>
                    <span className="text-muted-foreground">
                      {currentModel.cost_hint} · {currentModel.description}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="video-duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="video-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(currentModel?.durations ?? [5, 10]).map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} sec
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video-resolution">Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger id="video-resolution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(currentModel?.resolutions ?? ["720p"]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentModel?.supports_mode && (
                <div className="grid gap-2 sm:max-w-xs">
                  <Label htmlFor="video-mode">Grok mode</Label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger id="video-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fun">Fun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4" />
                Output
              </CardTitle>
              <CardDescription>Preview and download your generated clip.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "flex min-h-48 flex-col items-center justify-center rounded-xl border bg-muted/20 p-4 text-center",
                  statusKind === "working" && "border-primary/40",
                  statusKind === "done" && "border-emerald-500/40",
                  statusKind === "failed" && "border-destructive/40"
                )}
              >
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    className="max-h-64 w-full rounded-lg"
                    playsInline
                  />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-2 py-8">
                    <Film className="h-8 w-8 opacity-40" />
                    <p className="text-sm">Your video will appear here</p>
                  </div>
                )}
              </div>

              {status && (
                <p
                  className={cn(
                    "text-xs font-medium capitalize",
                    statusKind === "working" && "text-primary",
                    statusKind === "done" && "text-emerald-600 dark:text-emerald-400",
                    statusKind === "failed" && "text-destructive"
                  )}
                >
                  Status: {status}
                </p>
              )}

              {taskId && (
                <p className="text-muted-foreground truncate text-xs">
                  Task: <span className="font-mono">{taskId}</span>
                </p>
              )}

              <p
                className={cn(
                  "text-xs",
                  hintError ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {hint}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!canGenerate}
                  onClick={() => void handleGenerate()}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate video
                    </>
                  )}
                </Button>
                {videoUrl && (
                  <Button type="button" variant="outline" asChild>
                    <a href={videoUrl} download={`${taskId ?? "video"}.mp4`}>
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {gallery.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent videos</CardTitle>
                <CardDescription>Previously generated on this server.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {gallery.slice(0, 6).map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-muted/60 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-colors"
                  >
                    <span className="truncate font-medium">{item.name}</span>
                    <span className="text-muted-foreground shrink-0">
                      {item.size_mb} MB
                    </span>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="bg-card sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-lg">
        <p className="text-muted-foreground text-xs sm:text-sm">
          Default model: {defaultModel.replaceAll("-", " ")} · configure key in{" "}
          <code className="text-foreground">backend/.env</code>
        </p>
        <Button type="button" disabled={!canGenerate} onClick={() => void handleGenerate()}>
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate video
        </Button>
      </div>
    </div>
  )
}
