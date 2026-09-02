import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import type { Boat, TabId } from '../../lib/types'
import { BoatSelector } from './BoatSelector'
import { Logo } from './Logo'
import { TABS } from './TabBar'

interface SidebarProps {
  boats: Boat[]
  selectedBoat: Boat | null
  onSelectBoat: (boat: Boat) => void
  onCreateBoat: () => void
  active: TabId
  onChange: (tab: TabId) => void
  showTabs: boolean
}

/** Minimal icon-rail navigation matching the example with hover tooltips. */
export function Sidebar({
  boats,
  selectedBoat,
  onSelectBoat,
  onCreateBoat,
  active,
  onChange,
  showTabs,
}: SidebarProps) {
  const { t } = useI18n()

  return (
    <aside className="fixed top-4 left-4 bottom-4 z-40 hidden w-20 flex-col rounded-[24px] bg-primary-container text-white shadow-float border border-white/10 overflow-visible lg:flex">
      {/* Top Logo */}
      <div className="flex h-20 shrink-0 items-center justify-center border-b border-white/10 p-4">
        <Logo className="size-8 shrink-0" />
      </div>

      {/* Nav Icons with Hover Tooltips */}
      {showTabs && (
        <nav className="flex-1 space-y-2 py-6 px-3 overflow-visible">
          {TABS.map(({ id, labelKey, Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex size-12 mx-auto items-center justify-center rounded-2xl transition-all select-none cursor-pointer',
                  isActive
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-on-primary-container hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon
                  className={cn(
                    'size-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-on-primary-container group-hover:text-white',
                  )}
                />

                {/* Floating Tooltip on Hover */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-navy-muted text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-50 border border-white/10">
                  {t(labelKey)}
                </div>
              </button>
            )
          })}
        </nav>
      )}

      {/* Bottom Fleet / Boat Selector */}
      <div className="mt-auto border-t border-white/10 p-4 flex items-center justify-center">
        <BoatSelector
          compact
          dropUp
          boats={boats}
          selected={selectedBoat}
          onSelect={onSelectBoat}
          onCreate={onCreateBoat}
        />
      </div>
    </aside>
  )
}
