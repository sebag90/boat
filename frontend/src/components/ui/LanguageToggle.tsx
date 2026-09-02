import { useI18n, type Locale } from '../../i18n'
import { cn } from '../../lib/cn'

const LOCALES: Locale[] = ['en', 'it']

/** EN ⇄ IT switch, present on the login screen and in the header. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n()
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-outline-variant/40 bg-surface-container-low p-0.5 shadow-xs',
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
            'rounded-full px-3 py-1 label-caps transition-all duration-200 cursor-pointer font-semibold',
            locale === code
              ? 'bg-primary-container text-white shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
