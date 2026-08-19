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
        'group relative flex items-start gap-3 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-navy-200',
        'shadow-sm transition-all duration-200 ease-sail hover:-translate-y-px hover:ring-2 hover:ring-brass-400 hover:shadow-chart',
        muted && 'bg-navy-50',
        className,
      )}
    >
      {leading && <div className="mt-0.5 shrink-0">{leading}</div>}

      <button
        type="button"
        onClick={onClick}
        className="min-w-0 flex-1 text-left focus-visible:outline-none"
      >
        <span
          className={cn(
            'block truncate font-semibold text-navy-950',
            muted && 'text-navy-400 line-through',
          )}
        >
          {title}
        </span>
        {meta && <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">{meta}</span>}
        {excerpt && (
          <span className="mt-1.5 block truncate text-sm text-navy-600">{excerpt}</span>
        )}
      </button>

      <div className="flex shrink-0 items-center gap-1 self-center">
        {trailing}
        <ChevronRight className="size-4 text-navy-300 transition-colors group-hover:text-brass-600" />
      </div>
    </li>
  )
}

export function EntryList({ children }: { children: ReactNode }) {
  return <ul className="space-y-2.5">{children}</ul>
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
