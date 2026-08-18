import { useEffect, useState } from 'react'
import { Plus, Sailboat } from 'lucide-react'
import { useI18n } from '../i18n'
import { useBoats } from '../api/boats'
import { CreateBoatDialog } from '../components/fleet/CreateBoatDialog'
import { AppShell } from '../components/layout/AppShell'
import { Button, EmptyState, ErrorState, LoadingState } from '../components/ui'
import { useSelectedBoat } from '../hooks/useSelectedBoat'
import { useSession } from '../hooks/useSession'
import { UnauthorizedError } from '../lib/api'
import type { TabId } from '../lib/types'
import { TabContent } from './TabContent'

export function WorkspacePage() {
  const { t } = useI18n()
  const { logout } = useSession()
  const { data: boats, isPending, error, refetch } = useBoats()
  const { selectedBoat, select, clear } = useSelectedBoat(boats)
  const [activeTab, setActiveTab] = useState<TabId>('logbook')
  const [registering, setRegistering] = useState(false)

  // A 401 on the fleet bootstrap invalidates the stored session.
  useEffect(() => {
    if (error instanceof UnauthorizedError) logout()
  }, [error, logout])

  return (
    <AppShell
      boats={boats ?? []}
      selectedBoat={selectedBoat}
      onSelectBoat={select}
      onCreateBoat={() => setRegistering(true)}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showTabs={!!selectedBoat}
    >
      {isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (boats ?? []).length === 0 ? (
        <EmptyState
          icon={<Sailboat className="size-7" />}
          title={t('fleet.emptyTitle')}
          body={t('fleet.emptyBody')}
          action={
            <Button onClick={() => setRegistering(true)} icon={<Plus className="size-4" />}>
              {t('fleet.register')}
            </Button>
          }
        />
      ) : !selectedBoat ? (
        <EmptyState
          icon={<Sailboat className="size-7" />}
          title={t('fleet.noSelectionTitle')}
          body={t('fleet.noSelectionBody')}
        />
      ) : (
        <TabContent
          tab={activeTab}
          boat={selectedBoat}
          onBoatDeleted={() => {
            clear()
            setActiveTab('logbook')
          }}
        />
      )}

      {registering && (
        <CreateBoatDialog
          onClose={() => setRegistering(false)}
          onCreated={(boat) => {
            setRegistering(false)
            select(boat)
            setActiveTab('logbook')
          }}
        />
      )}
    </AppShell>
  )
}
