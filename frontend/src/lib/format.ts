/** DD-MM-YYYY from an ISO date (`YYYY-MM-DD`) or datetime string. */
export function formatDate(value?: string | null): string {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (match) return `${match[3]}-${match[2]}-${match[1]}`
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return `${pad(parsed.getDate())}-${pad(parsed.getMonth() + 1)}-${parsed.getFullYear()}`
}

/**
 * DD-MM-YYYY HH:MM. Naive timestamps are shown verbatim: the leading
 * `YYYY-MM-DDTHH:MM` is parsed textually first (spec §2.1).
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value)
  if (match) return `${match[3]}-${match[2]}-${match[1]} ${match[4]}:${match[5]}`
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return `${formatDate(parsed.toISOString())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
}

/** HH:MM only. */
export function formatTime(value?: string | null): string {
  const full = formatDateTime(value)
  return full.slice(11) || full
}

/** Today as `YYYY-MM-DD` in local time, for date inputs. */
export function todayInputValue(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Local-time ISO string without timezone suffix: `YYYY-MM-DDTHH:MM:SS`. */
export function localIsoTimestamp(date = new Date()): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

/** Parses stored timestamps, treating naive values as local time. */
export function parseTimestamp(value?: string | null): Date | null {
  if (!value) return null
  const naive = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  if (naive) {
    return new Date(
      Number(naive[1]),
      Number(naive[2]) - 1,
      Number(naive[3]),
      Number(naive[4]),
      Number(naive[5]),
      Number(naive[6] ?? 0),
    )
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${units[exponent]}`
}

export function formatCoordinate(value: number): string {
  return value.toFixed(5)
}

export function isPdf(filename?: string | null): boolean {
  return !!filename && filename.toLowerCase().endsWith('.pdf')
}

export function isImage(filename?: string | null, contentType?: string | null): boolean {
  if (contentType?.startsWith('image/')) return true
  return !!filename && /\.(png|jpe?g|gif|webp|bmp|svg|avif|heic)$/i.test(filename)
}

export function isVideo(filename?: string | null, contentType?: string | null): boolean {
  if (contentType?.startsWith('video/')) return true
  return !!filename && /\.(mp4|mov|webm|mkv|avi|m4v|ogv)$/i.test(filename)
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
