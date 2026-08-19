import { useI18n, type Locale } from '../../i18n'
import { cn } from '../../lib/cn'

const LOCALES: Locale[] = ['en', 'it']

/** EN ⇄ IT switch, present on the login screen and in the header. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n()
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-white p-0.5 ring-1 ring-navy-300',
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
            'rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wider uppercase transition-all duration-200',
            locale === code
              ? 'bg-navy-950 text-brass-300 shadow-sm'
              : 'text-navy-500 hover:bg-brass-100 hover:text-brass-800',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
