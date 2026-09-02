import { Paperclip } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Small "has attachment" hint used on list cards. */
export function AttachmentChip({
  filename,
  className,
}: {
  filename?: string | null
  className?: string
}) {
  if (!filename) return null
  return (
    <span
      className={cn(
        'inline-flex max-w-[14rem] items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-0.5 label-caps text-[10px] text-on-surface-variant font-medium',
        className,
      )}
    >
      <Paperclip className="size-3 shrink-0 text-secondary" />
      <span className="truncate">{filename}</span>
    </span>
  )
}
