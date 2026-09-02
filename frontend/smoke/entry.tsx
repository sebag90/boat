import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from '../src/App'
import { I18nProvider } from '../src/i18n'
import { SessionProvider } from '../src/hooks/useSession'
import { EntryDetailDialog } from '../src/components/detail/EntryDetailDialog'
import { VoyageDialog } from '../src/components/logbook/VoyageDialog'
import { DashboardTab } from '../src/components/dashboard/DashboardTab'
import { DocumentsTab } from '../src/components/documents/DocumentsTab'
import { LogbookTab } from '../src/components/logbook/LogbookTab'
import { MaintenanceTab } from '../src/components/maintenance/MaintenanceTab'
import { TodosTab } from '../src/components/todos/TodosTab'
import { ShoppingTab } from '../src/components/shopping/ShoppingTab'
import { SettingsTab } from '../src/components/settings/SettingsTab'
import { CreateVoyageDialog } from '../src/components/logbook/CreateVoyageDialog'
import { CreateBoatDialog } from '../src/components/fleet/CreateBoatDialog'
import { LoginPage } from '../src/pages/LoginPage'
import type { Boat, DocumentEntry, LogEntry } from '../src/lib/types'

const boat: Boat = { id: 1, name: 'Morning Star', description: '40ft', created_at: '2026-01-01T10:00:00Z' }

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const doc: DocumentEntry = {
  id: 1,
  title: 'Engine Manual',
  description: '**Page 42** covers the oil filter.',
  filename: 'manual.pdf',
  content_type: 'application/pdf',
  uploaded_at: '2026-01-01T12:00:00Z',
}

const voyage: LogEntry = {
  id: 1,
  date: '2026-06-15',
  crew: 'Skipper & Mate',
  start: 'Monaco Hercules',
  goal: 'Calvi',
  description: 'Wind 12kn NE',
  created_at: '2026-06-15T08:00:00Z',
  waypoints: [
    { id: 1, log_id: 1, latitude: 43.7384, longitude: 7.4246, timestamp: '2026-06-15T08:30:00', name: 'Start' },
    { id: 2, log_id: 1, latitude: 43.5, longitude: 8.0, timestamp: '2026-06-15T12:30:00', name: null },
  ],
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <App />
          <DashboardTab boat={boat} onNavigateTab={() => {}} />
          <LogbookTab boatId={1} />
          <EntryDetailDialog boatId={1} type="document" entry={doc} onClose={() => {}} />
          <VoyageDialog boatId={1} entry={voyage} onClose={() => {}} />
          <DocumentsTab boatId={1} />
          <MaintenanceTab boatId={1} />
          <TodosTab boatId={1} />
          <ShoppingTab boatId={1} />
          <SettingsTab boat={boat} onDeleted={() => {}} />
          <CreateVoyageDialog boatId={1} onClose={() => {}} onCreated={() => {}} />
          <CreateBoatDialog onClose={() => {}} onCreated={() => {}} />
          <LoginPage />
        </SessionProvider>
      </QueryClientProvider>
    </I18nProvider>
  </StrictMode>,
)
