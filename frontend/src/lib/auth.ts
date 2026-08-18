import { STORAGE_KEYS, clearStorage, readStorage, writeStorage } from './storage'

/** Base64 encodes credentials, non-ASCII safe (spec §2.3). */
export function encodeCredentials(username: string, password: string): string {
  return btoa(unescape(encodeURIComponent(`${username}:${password}`)))
}

export function getAuthHeader(): string | null {
  return readStorage(STORAGE_KEYS.authHeader)
}

/** The bare base64 token, used for `?auth=` attachment URLs. */
export function getAuthToken(): string {
  return (getAuthHeader() ?? '').replace(/^Basic\s+/i, '')
}

export function getCurrentUser(): string {
  return readStorage(STORAGE_KEYS.currentUser) ?? ''
}

export function saveSession(username: string, token: string): void {
  writeStorage(STORAGE_KEYS.authHeader, `Basic ${token}`)
  writeStorage(STORAGE_KEYS.currentUser, username)
}

export function clearSession(): void {
  clearStorage(STORAGE_KEYS.authHeader)
  clearStorage(STORAGE_KEYS.currentUser)
}

export function getApiHost(): string {
  return (readStorage(STORAGE_KEYS.apiHost) ?? '').trim()
}

export function setApiHost(host: string): void {
  const value = host.trim().replace(/\/+$/, '')
  if (value) writeStorage(STORAGE_KEYS.apiHost, value)
  else clearStorage(STORAGE_KEYS.apiHost)
}
