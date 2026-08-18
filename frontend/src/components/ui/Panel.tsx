import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PanelProps {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}

/** A chart-table surface: soft white card with a hairline navy rule. */
export function Panel({ children, className, as: Tag = 'section' }: PanelProps) {
  return (
    <Tag
      className={cn(
        'rounded-card bg-white/85 ring-1 ring-navy-200/70 shadow-chart backdrop-blur-sm',
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
        'flex flex-wrap items-start justify-between gap-3 border-b border-navy-100 px-5 py-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700 ring-1 ring-ocean-100">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-lg leading-tight font-semibold text-navy-950">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}
