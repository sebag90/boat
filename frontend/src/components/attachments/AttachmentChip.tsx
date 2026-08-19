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
        'inline-flex max-w-[14rem] items-center gap-1.5 rounded-lg bg-brass-100 px-2 py-1 text-xs font-medium text-brass-800 ring-1 ring-brass-200',
        className,
      )}
    >
      <Paperclip className="size-3.5 shrink-0" />
      <span className="truncate">{filename}</span>
    </span>
  )
}
