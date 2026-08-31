import { useI18n, type Locale } from '../../i18n'
import { cn } from '../../lib/cn'

const LOCALES: Locale[] = ['en', 'it']

/** EN ⇄ IT switch, present on the login screen and in the header. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n()
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-chip border border-navy-200 bg-white p-0.5',
        className,
      )}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            'rounded-sm px-2.5 py-1 label-mono transition-colors duration-200',
            locale === code
              ? 'bg-navy-900 text-white'
              : 'text-navy-500 hover:bg-navy-100 hover:text-navy-700',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
