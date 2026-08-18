import { useMemo } from 'react'
import { renderMarkdown } from '../lib/markdown'
import { cn } from '../lib/cn'

interface MarkdownProps {
  source?: string | null
  className?: string
  fallback?: string
}

/** Read-only Markdown block (descriptions, notes, tasks). */
export function Markdown({ source, className, fallback }: MarkdownProps) {
  const html = useMemo(() => renderMarkdown(source), [source])

  if (!html) {
    return fallback ? <p className="text-sm text-navy-400 italic">{fallback}</p> : null
  }

  return (
    <div
      className={cn('md-body', className)}
      // Sanitized with DOMPurify in renderMarkdown()
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
