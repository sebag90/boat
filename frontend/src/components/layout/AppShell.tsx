import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import type { Boat, TabId } from '../../lib/types'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
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
    <div className="min-h-dvh bg-surface text-on-surface">
      <Sidebar
        boats={boats}
        selectedBoat={selectedBoat}
        onSelectBoat={onSelectBoat}
        onCreateBoat={onCreateBoat}
        active={activeTab}
        onChange={onTabChange}
        showTabs={showTabs}
      />

      <div className="flex min-h-dvh flex-col lg:pl-72">
        <Header
          boats={boats}
          selectedBoat={selectedBoat}
          onSelectBoat={onSelectBoat}
          onCreateBoat={onCreateBoat}
        />

        <main className="w-full flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1360px]">
            {showTabs && (
              <div className="mb-5 lg:hidden">
                <TabBar active={activeTab} onChange={onTabChange} />
              </div>
            )}
            {children}
          </div>
        </main>

        <footer className="px-4 py-6 text-center label-caps text-on-surface-variant/70 sm:px-6 lg:px-8">
          {t('app.tagline')}
        </footer>
      </div>
    </div>
  )
}
