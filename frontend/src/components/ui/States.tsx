import type { ReactNode } from 'react'
import { AlertTriangle, LifeBuoy, Loader2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import { Button } from './Button'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} />
}

export function LoadingState({ label }: { label?: string }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-center gap-2.5 px-6 py-14 text-sm text-navy-400">
      <Spinner className="size-5 text-ocean-500" />
      {label ?? t('app.loading')}
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  body?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, body, icon, action }: EmptyStateProps) {
  return (
    <div className="chart-grid flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-200 px-6 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-white text-ocean-500 ring-1 ring-navy-100">
        {icon ?? <LifeBuoy className="size-7" />}
      </span>
      {title && <p className="font-display text-lg font-semibold text-navy-900">{title}</p>}
      {body && <p className="mt-1.5 max-w-sm text-sm text-navy-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50/70 px-6 py-10 text-center">
      <AlertTriangle className="size-7 text-signal-500" />
      <div>
        <p className="font-semibold text-navy-900">{t('app.error')}</p>
        <p className="mt-1 text-sm text-navy-600">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('app.retry')}
        </Button>
      )}
    </div>
  )
}

export function InlineError({ message }: { message?: string | null }) {
  if (!message) return null
  return (
    <p className="flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-signal-600 ring-1 ring-red-100">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  )
}
