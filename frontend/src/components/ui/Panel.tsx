import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PanelProps {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}

/** A chart-table surface: crisp white card over the deeper sea-blue ground. */
export function Panel({ children, className, as: Tag = 'section' }: PanelProps) {
  return (
    <Tag
      className={cn(
        'overflow-hidden rounded-card bg-white ring-1 ring-navy-200 shadow-chart',
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
        'relative flex flex-wrap items-start justify-between gap-3 border-b border-navy-200 bg-navy-50/70 px-5 py-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-brass-300 shadow-sm">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-lg leading-tight font-semibold text-navy-950">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      <span className="brass-rule absolute inset-x-0 bottom-0" />
    </div>
  )
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}
