/** Keys persisted in localStorage (contract defined by the functional spec). */
export const STORAGE_KEYS = {
  authHeader: 'auth_header',
  currentUser: 'current_user',
  apiHost: 'api_host',
  selectedBoatId: 'selected_boat_id',
  locale: 'app_locale',
} as const

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* storage unavailable (private mode) — ignore */
  }
}

export function clearStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
