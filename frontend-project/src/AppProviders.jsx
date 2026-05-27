import { AuthProvider } from './auth/useAuth'

export function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

