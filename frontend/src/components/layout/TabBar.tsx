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
      <ul className="flex min-w-max items-center gap-1 rounded-card border border-navy-200 bg-white p-1.5">
        {TABS.map(({ id, labelKey, Icon }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded px-3.5 py-2 text-sm whitespace-nowrap',
                  'transition-colors duration-200',
                  isActive
                    ? 'bg-tint-strong font-semibold text-navy-950'
                    : 'text-navy-600 hover:bg-tint hover:text-navy-950',
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
