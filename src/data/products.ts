export type ProductStatus = "active" | "draft" | "out_of_stock" | "archived"

export type Product = {
  id: string
  name: string
  description: string
  sku: string
  category: string
  price: number
  stock: number
  marketplace: string
  status: ProductStatus
  imageColor: string
  imageInitials: string
  images: string[]
}

export const productCategories = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Sports",
] as const

export const productStatuses = [
  "All Statuses",
  "Active",
  "Draft",
  "Out of Stock",
  "Archived",
] as const

function placeholderImage(label: string, from: string, to: string) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="480" height="480" fill="url(#g)"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
    font-family="system-ui,sans-serif" font-size="72" font-weight="700" fill="white" fill-opacity="0.9">${label}</text>
</svg>`.trim()
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function productImages(initials: string, from: string, to: string, count = 2) {
  return Array.from({ length: count }, (_, i) =>
    placeholderImage(i === 0 ? initials : `${initials}${i + 1}`, from, to)
  )
}

export const products: Product[] = [
  {
    id: "prd-001",
    name: "Wireless Earbuds Pro",
    description:
      "Premium true wireless earbuds with active noise cancellation, 32-hour battery life, and IPX5 water resistance. Ideal for commuting and workouts.",
    sku: "EL-WEB-001",
    category: "Electronics",
    price: 2499,
    stock: 142,
    marketplace: "Amazon",
    status: "active",
    imageColor: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
    imageInitials: "WE",
    images: productImages("WE", "#0ea5e9", "#0369a1"),
  },
  {
    id: "prd-002",
    name: "Cotton Oversized Tee",
    description:
      "Soft mid-weight cotton oversized tee with a relaxed fit and reinforced stitching. Everyday essential available in multiple colors.",
    sku: "FS-COT-014",
    category: "Fashion",
    price: 799,
    stock: 320,
    marketplace: "Myntra",
    status: "active",
    imageColor: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    imageInitials: "CT",
    images: productImages("CT", "#f43f5e", "#9f1239"),
  },
  {
    id: "prd-003",
    name: "Ceramic Coffee Mug Set",
    description:
      "Set of four stoneware mugs with a matte glaze finish. Microwave and dishwasher safe for daily use.",
    sku: "HL-MUG-008",
    category: "Home & Living",
    price: 1299,
    stock: 0,
    marketplace: "Meesho",
    status: "out_of_stock",
    imageColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    imageInitials: "CM",
    images: productImages("CM", "#f59e0b", "#b45309"),
  },
  {
    id: "prd-004",
    name: "Vitamin C Face Serum",
    description:
      "Brightening serum with 15% vitamin C, hyaluronic acid, and vitamin E. Lightweight formula for morning skincare routines.",
    sku: "BT-VCS-022",
    category: "Beauty",
    price: 899,
    stock: 86,
    marketplace: "Flipkart",
    status: "active",
    imageColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    imageInitials: "VC",
    images: productImages("VC", "#10b981", "#047857"),
  },
  {
    id: "prd-005",
    name: "Yoga Mat Extra Grip",
    description:
      "6mm non-slip yoga mat with alignment markers and a carrying strap. Suitable for hot yoga and home practice.",
    sku: "SP-YOG-003",
    category: "Sports",
    price: 1599,
    stock: 54,
    marketplace: "Shopify",
    status: "active",
    imageColor: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
    imageInitials: "YM",
    images: productImages("YM", "#14b8a6", "#0f766e"),
  },
  {
    id: "prd-006",
    name: "Smart LED Desk Lamp",
    description:
      "Adjustable desk lamp with touch controls, USB-C charging port, and three color temperature modes for focused work.",
    sku: "EL-LED-019",
    category: "Electronics",
    price: 1899,
    stock: 27,
    marketplace: "Amazon",
    status: "draft",
    imageColor: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
    imageInitials: "SL",
    images: productImages("SL", "#8b5cf6", "#5b21b6"),
  },
  {
    id: "prd-007",
    name: "Linen Throw Pillow",
    description:
      "Natural linen throw pillow with hidden zipper and hypoallergenic insert. Soft texture for sofas and beds.",
    sku: "HL-PIL-011",
    category: "Home & Living",
    price: 649,
    stock: 198,
    marketplace: "Meesho",
    status: "active",
    imageColor: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    imageInitials: "LP",
    images: productImages("LP", "#f97316", "#c2410c"),
  },
  {
    id: "prd-008",
    name: "Running Shoes Flex",
    description:
      "Lightweight road running shoes with responsive foam midsole and breathable mesh upper for everyday training.",
    sku: "SP-RUN-007",
    category: "Sports",
    price: 3499,
    stock: 12,
    marketplace: "Flipkart",
    status: "active",
    imageColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    imageInitials: "RS",
    images: productImages("RS", "#3b82f6", "#1d4ed8"),
  },
  {
    id: "prd-009",
    name: "Matte Lipstick Duo",
    description:
      "Long-wear matte lipstick duo featuring a nude and a bold shade. Creamy formula with buildable coverage.",
    sku: "BT-LIP-031",
    category: "Beauty",
    price: 549,
    stock: 0,
    marketplace: "Myntra",
    status: "archived",
    imageColor: "bg-pink-500/15 text-pink-700 dark:text-pink-400",
    imageInitials: "ML",
    images: productImages("ML", "#ec4899", "#be185d"),
  },
  {
    id: "prd-010",
    name: "Denim Jacket Classic",
    description:
      "Classic denim jacket with metal buttons, chest pockets, and a slightly tapered fit. Year-round layering staple.",
    sku: "FS-DNM-005",
    category: "Fashion",
    price: 2299,
    stock: 73,
    marketplace: "Shopify",
    status: "draft",
    imageColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
    imageInitials: "DJ",
    images: productImages("DJ", "#6366f1", "#3730a3"),
  },
  {
    id: "prd-011",
    name: "Bluetooth Speaker Mini",
    description:
      "Portable Bluetooth speaker with 12-hour playtime, IP67 rating, and punchy bass in a compact form factor.",
    sku: "EL-BSP-042",
    category: "Electronics",
    price: 1799,
    stock: 205,
    marketplace: "Amazon",
    status: "active",
    imageColor: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
    imageInitials: "BS",
    images: productImages("BS", "#06b6d4", "#0e7490"),
  },
  {
    id: "prd-012",
    name: "Scented Candle Trio",
    description:
      "Set of three soy wax candles in cedar, vanilla, and citrus scents. Clean burn with cotton wicks.",
    sku: "HL-CND-016",
    category: "Home & Living",
    price: 999,
    stock: 41,
    marketplace: "Meesho",
    status: "active",
    imageColor: "bg-yellow-500/15 text-yellow-800 dark:text-yellow-400",
    imageInitials: "SC",
    images: productImages("SC", "#eab308", "#a16207"),
  },
]

export function getProductById(id: string) {
  return products.find((product) => product.id === id)
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)
}
