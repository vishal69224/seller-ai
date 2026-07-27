import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { StoreIcon } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      navigate("/", { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Authentication failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <StoreIcon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-display text-2xl">
              {mode === "login" ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription>
              Multi Marketplace Seller Hub — sign in to manage products and connections.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {mode === "register" && (
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <Button type="submit" disabled={submitting || loading}>
              {submitting
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <p className="text-muted-foreground mt-4 text-center text-sm">
            {mode === "login" ? (
              <>
                No account?{" "}
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => {
                    setMode("register")
                    setError("")
                  }}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => {
                    setMode("login")
                    setError("")
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Or continue from{" "}
            <Link to="/" className="text-primary hover:underline">
              dashboard
            </Link>{" "}
            after signing in.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
