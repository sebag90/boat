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

/** Desktop primary navigation: fixed white rail, tonal active state. */
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
    <aside className="fixed top-0 left-0 z-40 hidden h-full w-72 flex-col border-r border-navy-200 bg-white lg:flex">
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-navy-200 px-6">
        <Logo className="size-8" />
        <span className="text-headline-md text-navy-950">{t('app.name')}</span>
      </div>

      {showTabs && (
        <nav className="flex-1 space-y-1 p-4">
          {TABS.map(({ id, labelKey, Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-4 rounded px-4 py-3 text-left transition-colors',
                  isActive
                    ? 'bg-tint-strong font-semibold text-navy-950'
                    : 'text-navy-600 hover:bg-tint hover:text-navy-950',
                )}
              >
                <Icon className="size-5 shrink-0" />
                {t(labelKey)}
              </button>
            )
          })}
        </nav>
      )}

      <div className="mt-auto border-t border-navy-200 p-4">
        <BoatSelector
          boats={boats}
          selected={selectedBoat}
          onSelect={onSelectBoat}
          onCreate={onCreateBoat}
        />
      </div>
    </aside>
  )
}
