import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { api, clearToken, getToken, setToken, type User } from "@/lib/api"

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      return
    }
    const me = await api.me()
    setUser(me)
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (getToken()) {
          const me = await api.me()
          if (active) setUser(me)
        }
      } catch {
        clearToken()
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password })
    setToken(res.access_token)
    const me = await api.me()
    setUser(me)
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.register({ name, email, password })
      setToken(res.access_token)
      const me = await api.me()
      setUser(me)
    },
    []
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const updateUser = useCallback(async (data: Partial<User>) => {
    const me = await api.updateMe(data)
    setUser(me)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, loading, login, register, logout, refreshUser, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
