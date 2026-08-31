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
        'inline-flex max-w-[14rem] items-center gap-1.5 rounded-chip bg-tint px-2.5 py-1 font-mono text-[0.7rem] text-navy-800',
        className,
      )}
    >
      <Paperclip className="size-3.5 shrink-0" />
      <span className="truncate">{filename}</span>
    </span>
  )
}
