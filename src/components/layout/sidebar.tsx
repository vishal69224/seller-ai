import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Store,
  History,
  BarChart3,
  Settings,
  X,
  StoreIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Products", icon: Package, to: "/products" },
  { label: "Orders", icon: ShoppingCart, to: "/orders" },
  { label: "Inventory", icon: Warehouse, to: "/inventory", disabled: true },
  { label: "Marketplace", icon: Store, to: "/marketplace" },
  { label: "Upload History", icon: History, to: "/upload-history" },
  { label: "Analytics", icon: BarChart3, to: "/analytics" },
  { label: "Settings", icon: Settings, to: "/settings" },
]

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <StoreIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-sm font-bold tracking-tight">
              Seller Hub
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">
              Multi Marketplace
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
              Menu
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon
              if (item.disabled) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/40"
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-50" />
                    {item.label}
                  </button>
                )
              }

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground"
                        )}
                      />
                      {item.label}
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/70 p-3">
            <p className="text-xs font-semibold text-sidebar-accent-foreground">
              Pro Plan
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/60">
              Sync unlimited marketplaces and automate listings.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
