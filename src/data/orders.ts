export type PaymentStatus = "paid" | "pending" | "failed" | "refunded"
export type DeliveryStatus =
  | "delivered"
  | "shipped"
  | "processing"
  | "cancelled"

export type Order = {
  id: string
  customer: string
  marketplace: string
  amount: number
  paymentStatus: PaymentStatus
  deliveryStatus: DeliveryStatus
  date: string
}

export const orderMarketplaces = [
  "All Marketplaces",
  "Amazon",
  "Flipkart",
  "Meesho",
  "Myntra",
  "Shopify",
] as const

export const paymentStatuses = [
  "All Payments",
  "Paid",
  "Pending",
  "Failed",
  "Refunded",
] as const

export const deliveryStatuses = [
  "All Delivery",
  "Delivered",
  "Shipped",
  "Processing",
  "Cancelled",
] as const

export const orders: Order[] = [
  {
    id: "ORD-4821",
    customer: "Priya Sharma",
    marketplace: "Amazon",
    amount: 2499,
    paymentStatus: "paid",
    deliveryStatus: "shipped",
    date: "2026-07-21",
  },
  {
    id: "ORD-4820",
    customer: "Rahul Mehta",
    marketplace: "Flipkart",
    amount: 3499,
    paymentStatus: "paid",
    deliveryStatus: "processing",
    date: "2026-07-21",
  },
  {
    id: "ORD-4819",
    customer: "Ananya Iyer",
    marketplace: "Myntra",
    amount: 799,
    paymentStatus: "pending",
    deliveryStatus: "processing",
    date: "2026-07-20",
  },
  {
    id: "ORD-4818",
    customer: "Vikram Patel",
    marketplace: "Meesho",
    amount: 1299,
    paymentStatus: "failed",
    deliveryStatus: "cancelled",
    date: "2026-07-20",
  },
  {
    id: "ORD-4817",
    customer: "Sneha Kapoor",
    marketplace: "Shopify",
    amount: 1599,
    paymentStatus: "paid",
    deliveryStatus: "delivered",
    date: "2026-07-19",
  },
  {
    id: "ORD-4816",
    customer: "Arjun Nair",
    marketplace: "Amazon",
    amount: 1899,
    paymentStatus: "paid",
    deliveryStatus: "delivered",
    date: "2026-07-18",
  },
  {
    id: "ORD-4815",
    customer: "Meera Joshi",
    marketplace: "Flipkart",
    amount: 899,
    paymentStatus: "refunded",
    deliveryStatus: "cancelled",
    date: "2026-07-17",
  },
  {
    id: "ORD-4814",
    customer: "Karan Singh",
    marketplace: "Myntra",
    amount: 2299,
    paymentStatus: "paid",
    deliveryStatus: "shipped",
    date: "2026-07-16",
  },
  {
    id: "ORD-4813",
    customer: "Divya Reddy",
    marketplace: "Meesho",
    amount: 649,
    paymentStatus: "paid",
    deliveryStatus: "delivered",
    date: "2026-07-15",
  },
  {
    id: "ORD-4812",
    customer: "Rohan Gupta",
    marketplace: "Shopify",
    amount: 999,
    paymentStatus: "pending",
    deliveryStatus: "processing",
    date: "2026-07-14",
  },
  {
    id: "ORD-4811",
    customer: "Ishita Bose",
    marketplace: "Amazon",
    amount: 1799,
    paymentStatus: "paid",
    deliveryStatus: "delivered",
    date: "2026-07-12",
  },
  {
    id: "ORD-4810",
    customer: "Aditya Rao",
    marketplace: "Flipkart",
    amount: 549,
    paymentStatus: "failed",
    deliveryStatus: "cancelled",
    date: "2026-07-10",
  },
]

export function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}
