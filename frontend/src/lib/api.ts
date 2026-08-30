import { getApiHost, getAuthHeader, getAuthToken } from './auth'

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'Unauthorized'
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function url(path: string): string {
  return `${getApiHost()}${path}`
}

/** Absolute URL for attachments, authenticated through the `?auth=` fallback. */
export function attachmentUrl(path: string): string {
  const token = getAuthToken()
  const base = url(path)
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}auth=${encodeURIComponent(token)}`
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  json?: unknown
  form?: FormData
  authHeader?: string
  signal?: AbortSignal
}

async function extractError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown }
    if (typeof body?.detail === 'string' && body.detail) return body.detail
    if (body?.detail) return JSON.stringify(body.detail)
  } catch {
    /* body was not JSON */
  }
  return `Request failed with status ${response.status}`
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', json, form, authHeader, signal } = options
  const headers: Record<string, string> = {}
  const auth = authHeader ?? getAuthHeader()
  if (auth) headers.Authorization = auth
  if (json !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(url(path), {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : form,
    signal,
  })

  if (response.status === 401) throw new UnauthorizedError()
  if (!response.ok) throw new ApiError(await extractError(response), response.status)

  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  postJson: <T>(path: string, json: unknown) => request<T>(path, { method: 'POST', json }),
  putJson: <T>(path: string, json: unknown) => request<T>(path, { method: 'PUT', json }),
  patchJson: <T>(path: string, json: unknown) => request<T>(path, { method: 'PATCH', json }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', form }),
  putForm: <T>(path: string, form: FormData) => request<T>(path, { method: 'PUT', form }),
  del: <T = { ok: boolean }>(path: string) => request<T>(path, { method: 'DELETE' }),
}

/** Appends `files[]` entries (multi-upload contract) or a single named field. */
export function appendFiles(form: FormData, files: File[], singleField?: string): void {
  if (files.length === 0) return
  if (files.length === 1 && singleField) {
    form.append(singleField, files[0])
    return
  }
  for (const file of files) form.append('files', file)
}
