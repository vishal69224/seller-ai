import { useEffect, useState } from "react"
import { CheckCircle2, Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { useAuth } from "@/context/auth-context"
import { ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, updateUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [business, setBusiness] = useState({
    company: "",
    gstin: "",
    address: "",
  })

  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    uploadFailures: true,
    lowStock: true,
    weeklyDigest: false,
    marketing: false,
  })

  useEffect(() => {
    if (!user) return
    setProfile({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    })
    setBusiness({
      company: user.company ?? "",
      gstin: user.gstin ?? "",
      address: user.address ?? "",
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      await updateUser({
        name: profile.name,
        phone: profile.phone,
        company: business.company,
        gstin: business.gstin,
        address: business.address,
      })
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your profile, business details, and preferences.
          </p>
        </div>
        <Button onClick={() => void handleSave()} disabled={saving}>
          Save Settings
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Settings saved successfully.
        </div>
      )}
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your personal account information shown across the hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              value={profile.name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={profile.email}
              disabled
              readOnly
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              value={profile.phone}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Company details used for invoices and your store.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="business-company">Company Name</Label>
              <Input
                id="business-company"
                value={business.company}
                onChange={(e) =>
                  setBusiness((prev) => ({ ...prev, company: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="business-gstin">GSTIN</Label>
              <Input
                id="business-gstin"
                value={business.gstin}
                onChange={(e) =>
                  setBusiness((prev) => ({ ...prev, gstin: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="business-address">Business Address</Label>
            <Textarea
              id="business-address"
              value={business.address}
              onChange={(e) =>
                setBusiness((prev) => ({ ...prev, address: e.target.value }))
              }
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose light or dark appearance for the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                theme === "light"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "hover:bg-muted/50"
              )}
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Light</p>
                <p className="text-muted-foreground text-xs">
                  Bright, daytime workspace
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                theme === "dark"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "hover:bg-muted/50"
              )}
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Dark</p>
                <p className="text-muted-foreground text-xs">
                  Low-glare evening mode
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Control which alerts you receive in the hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              ["orderAlerts", "Order alerts", "New orders and cancellations"],
              [
                "uploadFailures",
                "Upload failures",
                "Failed product syncs and listing errors",
              ],
              ["lowStock", "Low stock warnings", "Inventory below threshold"],
              [
                "weeklyDigest",
                "Weekly digest",
                "Summary of sales and activity",
              ],
              [
                "marketing",
                "Product tips",
                "Occasional tips to improve listings",
              ],
            ] as const
          ).map(([key, title, description]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <Label htmlFor={key} className="cursor-pointer">
                  {title}
                </Label>
                <p className="text-muted-foreground text-xs">{description}</p>
              </div>
              <Switch
                id={key}
                checked={notifications[key]}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
