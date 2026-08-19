import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import { IconButton } from './IconButton'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  eyebrow?: ReactNode
  size?: ModalSize
  footer?: ReactNode
  children: ReactNode
}

/** Backdrop click and Escape close the topmost dialog (spec §4.2.4). */
export function Modal({ open, onClose, title, eyebrow, size = 'md', footer, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const dialogs = document.querySelectorAll('[data-modal-panel]')
      if (dialogs[dialogs.length - 1] === panelRef.current) {
        event.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto overscroll-contain bg-navy-950/45 p-0 backdrop-blur-sm sm:items-start sm:p-6 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        data-modal-panel
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative flex max-h-[94dvh] w-full flex-col overflow-hidden bg-parchment shadow-float',
          'rounded-t-3xl sm:rounded-3xl ring-2 ring-navy-950/15',
          'animate-[modal-in_.28s_cubic-bezier(.32,.72,0,1)]',
          SIZES[size],
        )}
      >
        <ModalHeader title={title} eyebrow={eyebrow} onClose={onClose} />
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-navy-200 bg-white px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes modal-in{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}`}</style>
    </div>,
    document.body,
  )
}

function ModalHeader({
  title,
  eyebrow,
  onClose,
}: {
  title: ReactNode
  eyebrow?: ReactNode
  onClose: () => void
}) {
  const { t } = useI18n()
  return (
    <header className="relative flex items-start gap-4 border-b border-navy-200 bg-white px-5 py-4 sm:px-6">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="mb-1 text-[0.68rem] font-semibold tracking-[0.14em] text-brass-700 uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl leading-snug font-semibold break-words text-navy-950">{title}</h2>
      </div>
      <IconButton label={t('action.close')} icon={<X className="size-5" />} onClick={onClose} />
      <span className="brass-rule absolute inset-x-0 bottom-0" />
    </header>
  )
}
