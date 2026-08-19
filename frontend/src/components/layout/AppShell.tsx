import type { ReactNode } from 'react'
import { Anchor } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { Boat, TabId } from '../../lib/types'
import { Header } from './Header'
import { TabBar } from './TabBar'

interface AppShellProps {
  boats: Boat[]
  selectedBoat: Boat | null
  onSelectBoat: (boat: Boat) => void
  onCreateBoat: () => void
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  showTabs: boolean
  children: ReactNode
}

export function AppShell({
  boats,
  selectedBoat,
  onSelectBoat,
  onCreateBoat,
  activeTab,
  onTabChange,
  showTabs,
  children,
}: AppShellProps) {
  const { t } = useI18n()

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        boats={boats}
        selectedBoat={selectedBoat}
        onSelectBoat={onSelectBoat}
        onCreateBoat={onCreateBoat}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-7">
        {showTabs && (
          <div className="mb-5">
            <TabBar active={activeTab} onChange={onTabChange} />
          </div>
        )}
        {children}
      </main>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-6 text-xs text-navy-600">
        <Anchor className="size-3.5 text-brass-600" />
        <span>{t('app.tagline')}</span>
      </footer>
    </div>
  )
}
