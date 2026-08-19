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
    <div className="flex items-center justify-center gap-2.5 px-6 py-14 text-sm text-navy-600">
      <Spinner className="size-5 text-ocean-600" />
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
    <div className="chart-grid flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-300 bg-white/60 px-6 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-navy-950 text-brass-300 shadow-chart">
        {icon ?? <LifeBuoy className="size-7" />}
      </span>
      {title && <p className="font-display text-lg font-semibold text-navy-900">{title}</p>}
      {body && <p className="mt-1.5 max-w-sm text-sm text-navy-600">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-red-300 bg-red-50 px-6 py-10 text-center">
      <AlertTriangle className="size-7 text-signal-600" />
      <div>
        <p className="font-semibold text-navy-950">{t('app.error')}</p>
        <p className="mt-1 text-sm text-red-800">{message}</p>
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
    <p className="flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800 ring-1 ring-red-300">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-signal-600" />
      <span>{message}</span>
    </p>
  )
}
