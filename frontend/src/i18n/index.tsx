import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS, readStorage, writeStorage } from '../lib/storage'
import { en, type TranslationKey } from './en'
import { it } from './it'

export type Locale = 'en' | 'it'

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { en, it }

interface I18nValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function initialLocale(): Locale {
  const stored = readStorage(STORAGE_KEYS.locale)
  return stored === 'it' ? 'it' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeStorage(STORAGE_KEYS.locale, next)
    document.documentElement.lang = next
  }, [])

  const t = useCallback<I18nValue['t']>(
    (key, vars) => {
      let text = DICTIONARIES[locale][key] ?? en[key] ?? key
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replaceAll(`{${name}}`, String(value))
        }
      }
      return text
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>')
  return context
}

export type { TranslationKey }
