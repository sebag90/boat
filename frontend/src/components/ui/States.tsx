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
    <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-on-surface-variant">
      <Spinner className="size-5 text-secondary" />
      <span className="font-medium">{label ?? t('app.loading')}</span>
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
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-outline-variant/50 bg-surface-container-low/40 p-8 sm:p-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-secondary-fixed text-secondary shadow-xs">
        {icon ?? <LifeBuoy className="size-7" />}
      </span>
      {title && <p className="font-display text-lg sm:text-xl font-semibold text-primary">{title}</p>}
      {body && <p className="mt-1.5 max-w-sm text-sm text-on-surface-variant leading-relaxed">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-[24px] bg-error-container/20 border border-error-container/50 px-6 py-10 text-center">
      <AlertTriangle className="size-8 text-error" />
      <div>
        <p className="font-display font-semibold text-error">{t('app.error')}</p>
        <p className="mt-1 text-sm text-on-error-container">{message}</p>
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
    <p className="flex items-start gap-2 rounded-xl bg-error-container/30 px-3.5 py-2.5 text-sm font-medium text-on-error-container border border-error-container/60">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error" />
      <span>{message}</span>
    </p>
  )
}
