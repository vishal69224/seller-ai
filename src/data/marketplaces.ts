export type ConnectionStatus = "connected" | "disconnected" | "pending"

export type Marketplace = {
  id: string
  name: string
  description: string
  status: ConnectionStatus
  initials: string
  brandColor: string
  logoBg: string
  credentials: {
    clientId: string
    clientSecret: string
    merchantId: string
    sellerId: string
  }
}

export const marketplaces: Marketplace[] = [
  {
    id: "meesho",
    name: "Meesho",
    description: "Sell across India's social commerce network",
    status: "connected",
    initials: "M",
    brandColor: "text-[#9F2D55]",
    logoBg: "bg-[#FCE8F0]",
    credentials: {
      clientId: "msh_client_8f3a2b91",
      clientSecret: "msh_sec_••••••••••••x9k2",
      merchantId: "MER-MEESHO-10482",
      sellerId: "SLR-MSH-77821",
    },
  },
  {
    id: "flipkart",
    name: "Flipkart",
    description: "Reach millions of shoppers on Flipkart",
    status: "disconnected",
    initials: "Fk",
    brandColor: "text-[#2874F0]",
    logoBg: "bg-[#E8F1FE]",
    credentials: {
      clientId: "fk_client_demo_4c1e",
      clientSecret: "fk_sec_••••••••••••a3d7",
      merchantId: "MER-FK-22091",
      sellerId: "SLR-FK-55102",
    },
  },
  {
    id: "myntra",
    name: "Myntra",
    description: "List fashion & lifestyle products on Myntra",
    status: "pending",
    initials: "My",
    brandColor: "text-[#FF3F6C]",
    logoBg: "bg-[#FFE8EE]",
    credentials: {
      clientId: "myn_client_b7e2",
      clientSecret: "myn_sec_••••••••••••q1w8",
      merchantId: "MER-MYN-88314",
      sellerId: "SLR-MYN-33901",
    },
  },
  {
    id: "amazon",
    name: "Amazon",
    description: "Connect your Amazon Seller Central account",
    status: "connected",
    initials: "Az",
    brandColor: "text-[#FF9900]",
    logoBg: "bg-[#FFF4E0]",
    credentials: {
      clientId: "amz_client_spapi_91c",
      clientSecret: "amz_sec_••••••••••••p4n6",
      merchantId: "A1B2C3D4E5F6G7",
      sellerId: "A2SELLERIDDEMO",
    },
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Sync catalog & inventory with your Shopify store",
    status: "disconnected",
    initials: "Sh",
    brandColor: "text-[#96BF48]",
    logoBg: "bg-[#F0F7E4]",
    credentials: {
      clientId: "shp_api_key_demo_62",
      clientSecret: "shp_sec_••••••••••••m5t1",
      merchantId: "shop-demo-store.myshopify.com",
      sellerId: "gid://shopify/Shop/78123456",
    },
  },
]
