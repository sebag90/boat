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
}

export function BoatSelector({ boats, selected, onSelect, onCreate }: BoatSelectorProps) {
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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-left ring-1 shadow-sm transition-all sm:w-auto sm:min-w-[13rem]',
          open ? 'ring-2 ring-brass-400' : 'ring-navy-300 hover:ring-brass-400',
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-brass-300">
          <Sailboat className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-navy-950">
            {selected?.name ?? t('nav.selectVessel')}
          </span>
          <span className="block truncate text-[0.7rem] text-navy-500">
            {selected?.description || `${boats.length} ${t('fleet.vessels')}`}
          </span>
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-navy-500 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-xl bg-white ring-1 ring-navy-300 shadow-float sm:left-auto sm:w-72">
          <ul className="max-h-64 overflow-y-auto py-1">
            {boats.map((boat) => (
              <li key={boat.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(boat)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-ocean-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-navy-900">
                      {boat.name}
                    </span>
                    {boat.description && (
                      <span className="block truncate text-xs text-navy-500">
                        {boat.description}
                      </span>
                    )}
                  </span>
                  {selected?.id === boat.id && <Check className="size-4 shrink-0 text-foam-600" />}
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
            className="flex w-full items-center gap-2 border-t border-navy-200 bg-brass-50 px-3 py-2.5 text-sm font-semibold text-brass-800 hover:bg-brass-100"
          >
            <Plus className="size-4" />
            {t('nav.newVessel')}
          </button>
        </div>
      )}
    </div>
  )
}
