import { useState } from 'react'
import { Anchor, ChevronDown, Lock, Server, UserRound } from 'lucide-react'
import { useI18n } from '../i18n'
import { useSession } from '../hooks/useSession'
import { UnauthorizedError } from '../lib/api'
import { getApiHost, setApiHost } from '../lib/auth'
import { cn } from '../lib/cn'
import { Logo } from '../components/layout/Logo'
import { Button, Field, InlineError, LanguageToggle, Spinner, TextInput } from '../components/ui'

export function LoginPage() {
  const { t } = useI18n()
  const { login } = useSession()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [apiHost, setHost] = useState(() => getApiHost())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError(t('login.missing'))
      return
    }
    setError(null)
    setBusy(true)
    setApiHost(apiHost)
    try {
      await login(username.trim(), password)
    } catch (cause) {
      setError(
        cause instanceof UnauthorizedError
          ? t('login.failed')
          : cause instanceof Error
            ? cause.message
            : t('app.error'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <Horizon />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="size-11" />
            <div>
              <p className="font-display text-xl font-semibold text-navy-950">{t('app.name')}</p>
              <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-navy-400 uppercase">
                {t('app.fleet')}
              </p>
            </div>
          </div>
          <LanguageToggle />
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-card bg-white/90 px-6 py-7 ring-1 ring-navy-200/70 shadow-float backdrop-blur"
        >
          <h1 className="text-2xl font-semibold text-navy-950">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-navy-500">{t('login.subtitle')}</p>
          <div className="rope-divider my-5" />

          <div className="space-y-4">
            <Field label={t('login.username')} htmlFor="username">
              <IconInput
                id="username"
                icon={<UserRound className="size-4" />}
                value={username}
                autoComplete="username"
                autoCapitalize="none"
                onChange={setUsername}
              />
            </Field>

            <Field label={t('login.password')} htmlFor="password">
              <IconInput
                id="password"
                icon={<Lock className="size-4" />}
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={setPassword}
              />
            </Field>

            <InlineError message={error} />

            <Button type="submit" size="lg" full disabled={busy} icon={busy ? <Spinner /> : <Anchor className="size-4" />}>
              {busy ? t('login.working') : t('login.submit')}
            </Button>
          </div>

          <div className="mt-5 border-t border-navy-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="flex w-full items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-navy-800"
            >
              <Server className="size-3.5" />
              {t('login.advanced')}
              <ChevronDown
                className={cn('ml-auto size-4 transition-transform', showAdvanced && 'rotate-180')}
              />
            </button>
            {showAdvanced && (
              <div className="mt-3">
                <Field label={t('login.apiHost')} hint={t('login.apiHostHint')} htmlFor="apiHost">
                  <TextInput
                    id="apiHost"
                    value={apiHost}
                    inputMode="url"
                    placeholder="https://api.example.com"
                    onChange={(event) => setHost(event.target.value)}
                  />
                </Field>
              </div>
            )}
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-navy-400">{t('app.tagline')}</p>
      </div>
    </div>
  )
}

interface IconInputProps {
  id: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  autoCapitalize?: string
}

function IconInput({ id, icon, value, onChange, type = 'text', ...rest }: IconInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-navy-300">
        {icon}
      </span>
      <TextInput
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-10"
        {...rest}
      />
    </div>
  )
}

/** Decorative sea horizon behind the sign-in card. */
function Horizon() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="chart-grid absolute inset-0 opacity-60" />
      <svg
        className="absolute bottom-0 left-0 w-full text-ocean-300/40"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 224c120-32 240 32 360 32s240-64 360-64 240 64 360 64 240-32 360-64v128H0z"
        />
        <path
          fill="currentColor"
          fillOpacity="0.55"
          d="M0 272c120-32 240 16 360 16s240-48 360-48 240 48 360 48 240-24 360-48v80H0z"
        />
      </svg>
    </div>
  )
}
