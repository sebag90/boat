import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, MapPin, X } from 'lucide-react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import { searchLocations, type GeocodingResult } from '../../lib/geocoding'

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function LocationInput({
  value,
  onChange,
  placeholder,
  className,
}: LocationInputProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isValidated, setIsValidated] = useState(Boolean(value))

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setQuery(value)
    setIsValidated(Boolean(value))
  }, [value])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  function handleInputChange(text: string) {
    setQuery(text)
    onChange(text)
    setIsValidated(false)

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current)
    }

    if (!text.trim() || text.trim().length < 2) {
      setResults([])
      setOpen(false)
      setLoading(false)
      return
    }

    setLoading(true)
    debounceTimerRef.current = window.setTimeout(async () => {
      const items = await searchLocations(text)
      setResults(items)
      setOpen(items.length > 0)
      setLoading(false)
    }, 250)
  }

  function handleSelect(item: GeocodingResult) {
    setQuery(item.displayName)
    onChange(item.displayName)
    setIsValidated(true)
    setOpen(false)
    setResults([])
  }

  function handleClear() {
    setQuery('')
    onChange('')
    setResults([])
    setOpen(false)
    setIsValidated(false)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative flex items-center">
        <MapPin
          className={cn(
            'pointer-events-none absolute left-4 size-4 transition-colors z-10',
            isValidated ? 'text-secondary' : 'text-outline',
          )}
        />

        <input
          type="text"
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true)
          }}
          placeholder={placeholder ?? t('fleet.locationPlaceholder')}
          className={cn(
            'w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest py-3 pl-11 pr-12 text-sm text-on-surface shadow-xs transition-all duration-200',
            'placeholder:text-on-surface-variant/60 focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:outline-none',
          )}
        />

        <div className="absolute right-3 flex items-center gap-1.5 z-10">
          {loading && <Loader2 className="size-4 animate-spin text-secondary" />}

          {isValidated && !loading && (
            <span
              title="Location validated"
              className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700"
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
          )}

          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-float">
          <div className="px-4 py-2 border-b border-outline-variant/20 bg-surface-container-low/60 label-caps text-[10px] text-on-surface-variant font-bold">
            Select exact matching location
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {results.map((item) => (
              <li key={`${item.id}-${item.latitude}-${item.longitude}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <MapPin className="size-4 text-secondary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-on-surface">
                      {item.name}
                    </span>
                    <span className="block truncate text-xs text-on-surface-variant">
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  {item.countryCode && (
                    <span className="label-caps text-xs text-on-surface-variant/80 shrink-0 font-bold">
                      {item.countryCode.toUpperCase()}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
