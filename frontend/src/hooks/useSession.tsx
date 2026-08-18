import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import {
  clearSession,
  encodeCredentials,
  getAuthHeader,
  getCurrentUser,
  saveSession,
} from '../lib/auth'
import { STORAGE_KEYS, clearStorage } from '../lib/storage'
import type { Boat } from '../lib/types'

interface SessionValue {
  authenticated: boolean
  username: string
  /** Validates credentials against `GET /api/boats` and stores the session. */
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => !!getAuthHeader())
  const [username, setUsername] = useState(() => getCurrentUser())

  const login = useCallback(async (user: string, password: string) => {
    const token = encodeCredentials(user, password)
    await api.get<Boat[]>('/api/boats', { authHeader: `Basic ${token}` })
    saveSession(user, token)
    setUsername(user)
    setAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    clearStorage(STORAGE_KEYS.selectedBoatId)
    setUsername('')
    setAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ authenticated, username, login, logout }),
    [authenticated, username, login, logout],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside <SessionProvider>')
  return context
}
