import { Search, X } from 'lucide-react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const { t } = useI18n()
  return (
    <div className={cn('relative flex items-center group', className)}>
      <Search className="pointer-events-none absolute left-4 size-4 text-outline group-focus-within:text-secondary transition-colors" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? t('action.search')}
        className={cn(
          'w-full bg-surface-container-low border border-transparent rounded-full py-2.5 pl-11 pr-10 text-sm text-on-surface',
          'placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:border-secondary/40 focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all',
          '[&::-webkit-search-cancel-button]:hidden',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('action.clearAll')}
          className="absolute right-3 rounded-full p-1 text-on-surface-variant hover:bg-error hover:text-white transition-colors cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
