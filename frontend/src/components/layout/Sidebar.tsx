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

/** Desktop primary navigation: floating deep-navy bar with luxury glass styling. */
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
    <aside className="fixed top-4 left-4 bottom-4 z-40 hidden w-64 flex-col rounded-[24px] bg-primary-container text-white shadow-float border border-white/10 overflow-hidden lg:flex">
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-6">
        <Logo className="size-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="block truncate font-display text-lg font-bold text-white tracking-tight">
            {t('app.name')}
          </span>
          <span className="block truncate text-[10px] font-semibold tracking-widest text-on-primary-container uppercase">
            {t('app.fleet')}
          </span>
        </div>
      </div>

      {showTabs && (
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto scrollbar-none">
          {TABS.map(({ id, labelKey, Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left font-medium transition-all select-none',
                  isActive
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-on-primary-container hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon
                  className={cn(
                    'size-5 shrink-0 transition-transform duration-200 group-hover:scale-105',
                    isActive ? 'text-white' : 'text-on-primary-container group-hover:text-white',
                  )}
                />
                <span className="truncate text-sm font-medium">{t(labelKey)}</span>
                {isActive && (
                  <span className="ml-auto size-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>
      )}

      <div className="mt-auto border-t border-white/10 p-4 bg-primary-container/80 backdrop-blur-sm">
        <BoatSelector
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
