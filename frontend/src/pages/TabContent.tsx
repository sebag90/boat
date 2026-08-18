import { DocumentsTab } from '../components/documents/DocumentsTab'
import { LogbookTab } from '../components/logbook/LogbookTab'
import { MaintenanceTab } from '../components/maintenance/MaintenanceTab'
import { SettingsTab } from '../components/settings/SettingsTab'
import { ShoppingTab } from '../components/shopping/ShoppingTab'
import { TodosTab } from '../components/todos/TodosTab'
import type { Boat, TabId } from '../lib/types'

interface TabContentProps {
  tab: TabId
  boat: Boat
  onBoatDeleted: () => void
}

/** Only the active tab's collection is fetched (spec §4.4). */
export function TabContent({ tab, boat, onBoatDeleted }: TabContentProps) {
  switch (tab) {
    case 'logbook':
      return <LogbookTab boatId={boat.id} />
    case 'documents':
      return <DocumentsTab boatId={boat.id} />
    case 'maintenance':
      return <MaintenanceTab boatId={boat.id} />
    case 'todos':
      return <TodosTab boatId={boat.id} />
    case 'shopping':
      return <ShoppingTab boatId={boat.id} />
    case 'settings':
      return <SettingsTab boat={boat} onDeleted={onBoatDeleted} />
  }
}
