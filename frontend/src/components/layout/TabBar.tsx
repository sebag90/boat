import {
  BookOpen,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useI18n, type TranslationKey } from '../../i18n'
import { cn } from '../../lib/cn'
import type { TabId } from '../../lib/types'

interface TabDefinition {
  id: TabId
  labelKey: TranslationKey
  Icon: LucideIcon
}

/** Tab order: dashboard first, settings always last. */
export const TABS: TabDefinition[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', Icon: LayoutDashboard },
  { id: 'logbook', labelKey: 'nav.logbook', Icon: BookOpen },
  { id: 'documents', labelKey: 'nav.documents', Icon: FolderOpen },
  { id: 'maintenance', labelKey: 'nav.maintenance', Icon: Wrench },
  { id: 'todos', labelKey: 'nav.todos', Icon: ClipboardList },
  { id: 'shopping', labelKey: 'nav.shopping', Icon: ShoppingCart },
  { id: 'settings', labelKey: 'nav.settings', Icon: Settings },
]

interface TabBarProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  const { t } = useI18n()
  return (
    <nav className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max items-center gap-1.5 rounded-2xl bg-surface-container-low/90 p-1.5 backdrop-blur-md border border-outline-variant/30 shadow-xs">
        {TABS.map(({ id, labelKey, Icon }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm whitespace-nowrap',
                  'transition-all duration-200 select-none font-medium',
                  isActive
                    ? 'bg-secondary text-white shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                )}
              >
                <Icon className="size-4" />
                {t(labelKey)}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
