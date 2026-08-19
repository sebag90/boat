import {
  BookOpen,
  ClipboardList,
  FolderOpen,
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

/** Tab order is part of the spec (§4.4): settings is always last. */
export const TABS: TabDefinition[] = [
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
      <ul className="flex min-w-max items-center gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-navy-200 shadow-chart">
        {TABS.map(({ id, labelKey, Icon }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold whitespace-nowrap',
                  'transition-all duration-200 ease-sail',
                  isActive
                    ? 'bg-navy-950 text-white shadow-chart'
                    : 'text-navy-600 hover:bg-brass-100 hover:text-brass-800',
                )}
              >
                <Icon className={cn('size-4', isActive ? 'text-brass-300' : 'text-navy-400')} />
                {t(labelKey)}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
