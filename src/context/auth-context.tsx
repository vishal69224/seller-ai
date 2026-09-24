import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { api, clearToken, type User } from "@/lib/api"

type AuthContextValue = {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const FALLBACK_USER: User = {
  id: "guest",
  name: "Demo Seller",
  email: "guest@sellerhub.app",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.me()
      setUser(me)
    } catch {
      setUser(FALLBACK_USER)
    }
  }, [])

  useEffect(() => {
    let active = true
    clearToken()
    ;(async () => {
      try {
        const me = await api.me()
        if (active) setUser(me)
      } catch {
        if (active) setUser(FALLBACK_USER)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const updateUser = useCallback(async (data: Partial<User>) => {
    const me = await api.updateMe(data)
    setUser(me)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshUser,
      updateUser,
    }),
    [user, loading, refreshUser, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
