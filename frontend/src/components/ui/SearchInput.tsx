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
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-navy-300" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? t('action.search')}
        className={cn(
          'w-full rounded-xl border border-navy-200 bg-white py-2.5 pr-10 pl-10 text-sm',
          'placeholder:text-navy-300 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-200 focus:outline-none',
          '[&::-webkit-search-cancel-button]:hidden',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('action.clearAll')}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1 text-navy-400 hover:bg-navy-100 hover:text-navy-700"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
