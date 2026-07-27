import type { ApiMarketplace, ApiProduct } from "@/lib/api"
import type { Marketplace } from "@/data/marketplaces"
import type { Product } from "@/data/products"

export function mapApiProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    sku: p.sku,
    category: p.category,
    price: p.price,
    stock: p.stock,
    marketplace: p.marketplace,
    status: p.status,
    imageColor: p.image_color,
    imageInitials: p.image_initials,
    images: p.images,
  }
}

export function mapApiMarketplace(m: ApiMarketplace): Marketplace {
  return {
    id: m.marketplace_id,
    name: m.name,
    description: m.description,
    status: m.status,
    initials: m.initials,
    brandColor: m.brand_color,
    logoBg: m.logo_bg,
    credentials: {
      clientId: m.credentials.client_id,
      clientSecret: m.credentials.client_secret,
      merchantId: m.credentials.merchant_id,
      sellerId: m.credentials.seller_id,
    },
  }
}
