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
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10 bg-surface">
      <Horizon />

      <div className="relative w-full max-w-md z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="size-11" />
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-primary">
                {t('app.name')}
              </p>
              <p className="label-caps text-secondary font-semibold">{t('app.fleet')}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[24px] bg-surface-container-lowest border border-outline-variant/30 px-7 py-8 shadow-float"
        >
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            {t('login.title')}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">{t('login.subtitle')}</p>
          <div className="rope-divider my-6" />

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

            <Button
              type="submit"
              size="lg"
              full
              disabled={busy}
              icon={busy ? <Spinner /> : <Anchor className="size-4.5" />}
              className="mt-2"
            >
              {busy ? t('login.working') : t('login.submit')}
            </Button>
          </div>

          <div className="mt-6 border-t border-outline-variant/20 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="flex w-full items-center gap-2 label-caps text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <Server className="size-3.5 text-secondary" />
              <span>{t('login.advanced')}</span>
              <ChevronDown
                className={cn('ml-auto size-4 transition-transform', showAdvanced && 'rotate-180')}
              />
            </button>
            {showAdvanced && (
              <div className="mt-4">
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

        <p className="mt-6 text-center label-caps text-on-surface-variant/70">{t('app.tagline')}</p>
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
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-outline">
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

/** Luxury atmospheric backdrop. */
function Horizon() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="chart-grid absolute inset-0 opacity-40" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary-fixed/40 to-transparent" />
    </div>
  )
}
