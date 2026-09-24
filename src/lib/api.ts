const TOKEN_KEY = "seller_hub_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.status = status
    this.detail = detail
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }
  if (auth) {
    const token = getToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail.map((d: { msg?: string }) => d.msg).join(", ")
          : "Request failed"
    throw new ApiError(response.status, detail)
  }

  return data as T
}

export type User = {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  gstin?: string | null
  address?: string | null
}

export type ApiProduct = {
  id: string
  name: string
  description: string
  sku: string
  category: string
  brand?: string | null
  price: number
  discount: number
  stock: number
  marketplace: string
  marketplaces?: string[]
  status: "active" | "draft" | "out_of_stock" | "archived"
  images: string[]
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  image_color: string
  image_initials: string
}

export type ApiMarketplace = {
  id: string
  marketplace_id: string
  name: string
  description: string
  status: "connected" | "disconnected" | "pending"
  initials: string
  brand_color: string
  logo_bg: string
  credentials: {
    client_id: string
    client_secret: string
    merchant_id: string
    seller_id: string
  }
}

export const api = {
  me: () => request<User>("/auth/me"),

  updateMe: (body: Partial<User>) =>
    request<User>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  listProducts: (params?: {
    search?: string
    category?: string
    status?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.search) query.set("search", params.search)
    if (params?.category) query.set("category", params.category)
    if (params?.status) query.set("status", params.status)
    const qs = query.toString()
    return request<ApiProduct[]>(`/products${qs ? `?${qs}` : ""}`)
  },

  getProduct: (id: string) => request<ApiProduct>(`/products/${id}`),

  createProduct: (body: Record<string, unknown>) =>
    request<ApiProduct>("/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProduct: (id: string, body: Record<string, unknown>) =>
    request<ApiProduct>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),

  listMarketplaces: () => request<ApiMarketplace[]>("/marketplaces"),

  connectMarketplace: (body: {
    marketplace_id: string
    status?: string
    credentials: {
      client_id: string
      client_secret: string
      merchant_id: string
      seller_id: string
    }
  }) =>
    request<ApiMarketplace>("/marketplaces/connect", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteMarketplace: (marketplaceId: string) =>
    request<void>(`/marketplaces/${marketplaceId}`, { method: "DELETE" }),

  testMarketplace: (body: {
    marketplace_id: string
    credentials: {
      client_id: string
      client_secret: string
      merchant_id: string
      seller_id: string
    }
  }) =>
    request<{ success: boolean; message: string }>("/marketplaces/test", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  videoHealth: () => request<VideoHealth>("/video/health"),

  videoCredits: () => request<{ credits: number | null }>("/video/credits"),

  videoGenerate: (form: FormData) =>
    requestMultipart<VideoGenerateResponse>("/video/generate", form),

  videoTaskStatus: (taskId: string) =>
    request<VideoTaskStatus>(`/video/tasks/${encodeURIComponent(taskId)}`),

  videoGallery: () => request<{ items: VideoGalleryItem[] }>("/video/gallery"),
}

export type VideoModel = {
  key: string
  label: string
  description: string
  cost_tier: "low" | "mid" | "high"
  cost_hint: string
  max_images: number
  second_image_label: string
  durations: number[]
  resolutions: string[]
  default_duration: number
  default_resolution: string
  supports_audio: boolean
  supports_mode: boolean
}

export type VideoHealth = {
  ok: boolean
  api_key_configured: boolean
  models: VideoModel[]
  default_prompt: string
  default_model: string
}

export type VideoGenerateResponse = {
  task_id: string
  model: string
  model_id: string
  image_urls: string[]
  prompt: string
}

export type VideoTaskStatus = {
  task_id: string
  state: string
  fail_msg: string
  credits_consumed?: number | null
  result_urls: string[]
  video_urls: string[]
  local_paths: string[]
}

export type VideoGalleryItem = {
  name: string
  url: string
  size_mb: number
}

async function requestMultipart<T>(path: string, body: FormData): Promise<T> {
  const headers = new Headers()
  const token = getToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const response = await fetch(`/api${path}`, {
    method: "POST",
    headers,
    body,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail.map((d: { msg?: string }) => d.msg).join(", ")
          : "Request failed"
    throw new ApiError(response.status, detail)
  }

  return data as T
}

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type || "image/png" })
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
