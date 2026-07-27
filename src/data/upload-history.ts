export type UploadStatus = "success" | "failed" | "pending"

export type UploadRecord = {
  id: string
  product: string
  sku: string
  marketplace: string
  uploadDate: string
  status: UploadStatus
  errorMessage: string | null
}

export const uploadMarketplaces = [
  "All Marketplaces",
  "Amazon",
  "Flipkart",
  "Meesho",
  "Myntra",
  "Shopify",
] as const

export const uploadStatuses = [
  "All Statuses",
  "Success",
  "Failed",
  "Pending",
] as const

export const uploadDateFilters = [
  "All Dates",
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Older",
] as const

export const uploadHistory: UploadRecord[] = [
  {
    id: "up-001",
    product: "Wireless Earbuds Pro",
    sku: "EL-WEB-001",
    marketplace: "Amazon",
    uploadDate: "2026-07-21",
    status: "success",
    errorMessage: null,
  },
  {
    id: "up-002",
    product: "Cotton Oversized Tee",
    sku: "FS-COT-014",
    marketplace: "Myntra",
    uploadDate: "2026-07-21",
    status: "pending",
    errorMessage: null,
  },
  {
    id: "up-003",
    product: "Ceramic Coffee Mug Set",
    sku: "HL-MUG-008",
    marketplace: "Meesho",
    uploadDate: "2026-07-20",
    status: "failed",
    errorMessage: "Invalid category mapping for marketplace taxonomy.",
  },
  {
    id: "up-004",
    product: "Vitamin C Face Serum",
    sku: "BT-VCS-022",
    marketplace: "Flipkart",
    uploadDate: "2026-07-19",
    status: "success",
    errorMessage: null,
  },
  {
    id: "up-005",
    product: "Yoga Mat Extra Grip",
    sku: "SP-YOG-003",
    marketplace: "Shopify",
    uploadDate: "2026-07-18",
    status: "success",
    errorMessage: null,
  },
  {
    id: "up-006",
    product: "Smart LED Desk Lamp",
    sku: "EL-LED-019",
    marketplace: "Amazon",
    uploadDate: "2026-07-17",
    status: "failed",
    errorMessage: "Image resolution below minimum 1000×1000 requirement.",
  },
  {
    id: "up-007",
    product: "Running Shoes Flex",
    sku: "SP-RUN-007",
    marketplace: "Flipkart",
    uploadDate: "2026-07-15",
    status: "pending",
    errorMessage: null,
  },
  {
    id: "up-008",
    product: "Denim Jacket Classic",
    sku: "FS-DNM-005",
    marketplace: "Shopify",
    uploadDate: "2026-07-10",
    status: "success",
    errorMessage: null,
  },
  {
    id: "up-009",
    product: "Matte Lipstick Duo",
    sku: "BT-LIP-031",
    marketplace: "Myntra",
    uploadDate: "2026-06-28",
    status: "failed",
    errorMessage: "Brand authorization missing for beauty listings.",
  },
  {
    id: "up-010",
    product: "Bluetooth Speaker Mini",
    sku: "EL-BSP-042",
    marketplace: "Amazon",
    uploadDate: "2026-06-12",
    status: "success",
    errorMessage: null,
  },
]

export function matchesDateFilter(dateStr: string, filter: string) {
  if (filter === "All Dates") return true
  const today = new Date("2026-07-21")
  const date = new Date(dateStr)
  const diffDays = Math.floor(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (filter === "Today") return diffDays === 0
  if (filter === "Last 7 days") return diffDays >= 0 && diffDays <= 7
  if (filter === "Last 30 days") return diffDays >= 0 && diffDays <= 30
  if (filter === "Older") return diffDays > 30
  return true
}
