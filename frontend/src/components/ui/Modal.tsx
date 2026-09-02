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
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto overscroll-contain bg-primary-container/60 p-0 backdrop-blur-md sm:items-start sm:p-6 sm:py-10"
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
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-surface-container-lowest shadow-float border border-outline-variant/40',
          'rounded-t-[24px] sm:rounded-[24px]',
          'animate-[modal-in_.28s_cubic-bezier(.32,.72,0,1)]',
          SIZES[size],
        )}
      >
        <ModalHeader title={title} eyebrow={eyebrow} onClose={onClose} />
        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-7">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-outline-variant/30 bg-surface-container-low/60 px-6 py-4">
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
    <header className="relative flex items-start gap-4 border-b border-outline-variant/30 bg-surface-container-lowest px-6 py-5">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="label-caps text-secondary font-semibold mb-1">{eyebrow}</p>
        )}
        <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-primary">
          {title}
        </h2>
      </div>
      <IconButton
        label={t('action.close')}
        icon={<X className="size-5" />}
        onClick={onClose}
        className="-mr-2 -mt-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
      />
    </header>
  )
}
