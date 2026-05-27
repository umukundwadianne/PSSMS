import { createContext, useContext, useMemo, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // Backend doesn't expose /me; keep UI state after login.
  // If user refreshes, they can log in again.

  const value = useMemo(
    () => ({
      user,
      login: async (username, password) => {
        const res = await api.post('/api/auth/login', { username, password })
        const u = res.data?.user
        setUser(u ? { id: u.id, username: u.username, role: u.role } : null)
      },
      logout: async () => {
        await api.post('/api/auth/logout')
        setUser(null)
      },
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

