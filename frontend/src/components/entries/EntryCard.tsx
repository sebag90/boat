import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

interface EntryCardProps {
  onClick: () => void
  title: ReactNode
  meta?: ReactNode
  excerpt?: string | null
  leading?: ReactNode
  trailing?: ReactNode
  muted?: boolean
  className?: string
}

/**
 * One record in a list: click opens the read-only detail dialog (spec §4.2).
 * Descriptions are shown as a single-line excerpt here, never as raw Markdown.
 */
export function EntryCard({
  onClick,
  title,
  meta,
  excerpt,
  leading,
  trailing,
  muted,
  className,
}: EntryCardProps) {
  return (
    <li
      className={cn(
        'group relative flex min-h-[56px] items-center gap-3.5 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-xs',
        'transition-all duration-200 hover:border-secondary/40 hover:shadow-chart hover:translate-y-[-1px]',
        muted && 'bg-surface-container-low/60 border-transparent shadow-none hover:translate-y-0',
        className,
      )}
    >
      {leading && <div className="shrink-0">{leading}</div>}

      <button
        type="button"
        onClick={onClick}
        className="min-w-0 flex-1 text-left focus-visible:outline-none cursor-pointer"
      >
        <span
          className={cn(
            'block truncate text-base font-semibold text-primary',
            muted && 'text-on-surface-variant/60 line-through font-normal',
          )}
        >
          {title}
        </span>
        {meta && <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">{meta}</span>}
        {excerpt && (
          <span className="mt-1.5 block truncate text-sm text-on-surface-variant">{excerpt}</span>
        )}
      </button>

      <div className="flex shrink-0 items-center gap-1.5 self-center">
        {trailing}
        <button
          type="button"
          onClick={onClick}
          className="flex size-8 items-center justify-center rounded-xl text-on-surface-variant/60 group-hover:text-secondary group-hover:bg-secondary-fixed/50 transition-all cursor-pointer"
        >
          <ChevronRight className="size-4.5" />
        </button>
      </div>
    </li>
  )
}

export function EntryList({ children }: { children: ReactNode }) {
  return <ul className="space-y-3">{children}</ul>
}

/** Strips Markdown syntax for single-line previews. */
export function excerptOf(source?: string | null, length = 160): string {
  if (!source) return ''
  const plain = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > length ? `${plain.slice(0, length)}…` : plain
}
