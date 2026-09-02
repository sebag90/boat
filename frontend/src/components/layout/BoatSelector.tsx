import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Plus, Sailboat } from 'lucide-react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import type { Boat } from '../../lib/types'

interface BoatSelectorProps {
  boats: Boat[]
  selected: Boat | null
  onSelect: (boat: Boat) => void
  onCreate: () => void
  dropUp?: boolean
  compact?: boolean
}

export function BoatSelector({
  boats,
  selected,
  onSelect,
  onCreate,
  dropUp,
  compact = false,
}: BoatSelectorProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  if (compact) {
    return (
      <div ref={containerRef} className="relative flex justify-center">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="group relative flex size-12 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/15 border border-white/10 transition-all cursor-pointer shadow-xs"
        >
          <Sailboat className="size-5 text-white" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-navy-muted text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md border border-white/10">
            {selected?.name ?? t('nav.selectVessel')}
          </div>
        </button>

        {open && (
          <div className="absolute left-full bottom-0 ml-3 w-64 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-float z-50 animate-[modal-in_.2s_ease-out]">
            <div className="px-4 py-2.5 border-b border-outline-variant/20 bg-surface-container-low/60 label-caps text-[10px] text-on-surface-variant font-bold">
              {t('app.fleet')}
            </div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {boats.map((boat) => (
                <li key={boat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(boat)
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-surface-container-low cursor-pointer"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-on-surface">
                        {boat.name}
                      </span>
                      {boat.description && (
                        <span className="block truncate text-xs text-on-surface-variant">
                          {boat.description}
                        </span>
                      )}
                    </span>
                    {selected?.id === boat.id && (
                      <Check className="size-4 shrink-0 text-secondary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                onCreate()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 border-t border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm font-semibold text-secondary hover:bg-surface-container transition-colors cursor-pointer"
            >
              <Plus className="size-4" />
              {t('nav.newVessel')}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all sm:min-w-[13rem] cursor-pointer',
          dropUp
            ? 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
            : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/30',
        )}
      >
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl',
            dropUp ? 'bg-secondary text-white' : 'bg-primary-fixed text-on-primary-fixed',
          )}
        >
          <Sailboat className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-sm font-semibold',
              dropUp ? 'text-white' : 'text-on-surface',
            )}
          >
            {selected?.name ?? t('nav.selectVessel')}
          </span>
          <span
            className={cn(
              'block truncate text-[11px]',
              dropUp ? 'text-on-primary-container' : 'text-on-surface-variant',
            )}
          >
            {selected?.description || `${boats.length} ${t('fleet.vessels')}`}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform',
            dropUp ? 'text-on-primary-container' : 'text-on-surface-variant',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 left-0 z-50 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-float',
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2 sm:left-auto sm:w-72',
          )}
        >
          <ul className="max-h-64 overflow-y-auto py-1">
            {boats.map((boat) => (
              <li key={boat.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(boat)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-surface-container-low cursor-pointer"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-on-surface">
                      {boat.name}
                    </span>
                    {boat.description && (
                      <span className="block truncate text-xs text-on-surface-variant">
                        {boat.description}
                      </span>
                    )}
                  </span>
                  {selected?.id === boat.id && <Check className="size-4 shrink-0 text-secondary" />}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              onCreate()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 border-t border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm font-semibold text-secondary hover:bg-surface-container transition-colors cursor-pointer"
          >
            <Plus className="size-4" />
            {t('nav.newVessel')}
          </button>
        </div>
      )}
    </div>
  )
}
