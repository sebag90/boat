import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PanelProps {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}

/** Bento Card: rounded-[24px], frosted glass or crisp surface, subtle outline, soft ambient shadow. */
export function Panel({ children, className, as: Tag = 'section' }: PanelProps) {
  return (
    <Tag
      className={cn(
        'overflow-hidden rounded-[24px] bg-surface-container-lowest border border-outline-variant/30 shadow-sm transition-shadow duration-200',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

interface PanelHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PanelHeader({ title, subtitle, icon, actions, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'relative flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 px-6 py-5',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold text-primary">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 label-caps text-on-surface-variant font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6 sm:p-7', className)}>{children}</div>
}
