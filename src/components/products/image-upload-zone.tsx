import { useCallback, useRef, useState, type DragEvent } from "react"
import { ChevronLeft, ChevronRight, GripVertical, ImagePlus, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PreviewImage = {
  id: string
  url: string
  file?: File
  name?: string
}

type ImageUploadZoneProps = {
  images: PreviewImage[]
  onChange: (images: PreviewImage[]) => void
  maxFiles?: number
}

function revokeIfBlob(url: string) {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url)
}

export function ImageUploadZone({
  images,
  onChange,
  maxFiles = 8,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList).filter((file) =>
        file.type.startsWith("image/")
      )
      if (incoming.length === 0) return

      const remaining = maxFiles - images.length
      const selected = incoming.slice(0, remaining)

      const next = selected.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        name: file.name,
        url: URL.createObjectURL(file),
      }))

      onChange([...images, ...next])
    },
    [images, maxFiles, onChange]
  )

  const removeImage = (id: string) => {
    const target = images.find((img) => img.id === id)
    if (target) revokeIfBlob(target.url)
    onChange(images.filter((img) => img.id !== id))
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const onDropFiles = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files)
    }
  }

  const onReorderDrop = (toIndex: number) => {
    if (dragIndex === null) return
    moveImage(dragIndex, toIndex)
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault()
          if (dragIndex === null) setDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (dragIndex === null) setDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragging(false)
        }}
        onDrop={onDropFiles}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
        )}
      >
        <div
          className={cn(
            "mb-3 flex h-12 w-12 items-center justify-center rounded-full",
            dragging ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {dragging ? <Upload className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
        </div>
        <p className="font-display text-sm font-semibold">
          {dragging ? "Drop images here" : "Drag & drop product images"}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          PNG, JPG, or WEBP · up to {maxFiles} images · drag previews to reorder
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
        >
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {images.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">
              Media{" "}
              <span className="text-muted-foreground font-normal">
                ({images.length}/{maxFiles})
              </span>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-8"
              onClick={() => {
                images.forEach((img) => revokeIfBlob(img.url))
                onChange([])
              }}
            >
              Clear all
            </Button>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image, index) => {
              const label = image.name ?? image.file?.name ?? `Image ${index + 1}`
              return (
                <li
                  key={image.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setOverIndex(index)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onReorderDrop(index)
                  }}
                  onDragEnd={() => {
                    setDragIndex(null)
                    setOverIndex(null)
                  }}
                  className={cn(
                    "group bg-muted/30 relative aspect-square cursor-grab overflow-hidden rounded-xl border active:cursor-grabbing",
                    overIndex === index && dragIndex !== null && dragIndex !== index
                      ? "ring-primary ring-2"
                      : "",
                    dragIndex === index ? "opacity-60" : ""
                  )}
                >
                  <img
                    src={image.url}
                    alt={label}
                    className="pointer-events-none h-full w-full object-cover"
                  />
                  <div className="bg-background/80 absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-md opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                    <GripVertical className="text-muted-foreground h-4 w-4" />
                  </div>
                  {index === 0 && (
                    <span className="bg-primary text-primary-foreground absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold group-hover:hidden">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="bg-background/90 text-foreground absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Remove ${label}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/75 to-transparent px-1.5 pt-8 pb-1.5">
                    <button
                      type="button"
                      className="rounded bg-white/15 p-1 text-white hover:bg-white/25 disabled:opacity-30"
                      disabled={index === 0}
                      onClick={() => moveImage(index, index - 1)}
                      aria-label="Move left"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="truncate text-[10px] text-white">{label}</span>
                    <button
                      type="button"
                      className="rounded bg-white/15 p-1 text-white hover:bg-white/25 disabled:opacity-30"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, index + 1)}
                      aria-label="Move right"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
