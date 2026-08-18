import { useMemo, useState } from 'react'
import { BookOpen, Plus, Route } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useLogbook } from '../../api/logbook'
import { formatDate } from '../../lib/format'
import { totalFleetDistance } from '../../lib/nautical'
import type { LogEntry } from '../../lib/types'
import { FormPanel, ListPanel, TabHeading } from '../entries/TabScaffold'
import { Badge, Button, EmptyState, ErrorState, LoadingState, SearchInput } from '../ui'
import { CreateVoyageDialog } from './CreateVoyageDialog'
import { VoyageCard } from './VoyageCard'
import { VoyageDialog } from './VoyageDialog'

export function LogbookTab({ boatId }: { boatId: number }) {
  const { t } = useI18n()
  const { data, isPending, error, refetch } = useLogbook(boatId)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<number | null>(null)

  const voyages = data ?? []
  const filtered = useMemo(() => filterVoyages(voyages, query), [voyages, query])
  const totalNm = useMemo(() => totalFleetDistance(voyages), [voyages])
  const open = voyages.find((entry) => entry.id === openId) ?? null

  return (
    <>
      <TabHeading
        title={t('logbook.title')}
        subtitle={t('logbook.subtitle')}
        icon={<BookOpen className="size-5" />}
        aside={
          <Badge tone="ocean" icon={<Route className="size-3" />}>
            {t('logbook.totalLogged')} {totalNm.toFixed(1)} NM
          </Badge>
        }
      />

      <FormPanel title={t('logbook.new')} icon={<BookOpen className="size-4" />}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-navy-500">{t('logbook.subtitle')}</p>
          <Button onClick={() => setCreating(true)} icon={<Plus className="size-4" />}>
            {t('logbook.new')}
          </Button>
        </div>
      </FormPanel>

      <ListPanel
        title={t('logbook.title')}
        count={filtered.length}
        countLabel={t('logbook.voyages')}
        search={
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t('logbook.searchPlaceholder')}
          />
        }
      >
        {isPending ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState body={query ? t('logbook.emptySearch') : t('logbook.empty')} />
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((entry) => (
              <VoyageCard key={entry.id} entry={entry} onClick={() => setOpenId(entry.id)} />
            ))}
          </ul>
        )}
      </ListPanel>

      {creating && (
        <CreateVoyageDialog
          boatId={boatId}
          onClose={() => setCreating(false)}
          onCreated={(entry) => {
            setCreating(false)
            setOpenId(entry.id)
          }}
        />
      )}

      {open && <VoyageDialog boatId={boatId} entry={open} onClose={() => setOpenId(null)} />}
    </>
  )
}

/** Client-side filter over start, goal, crew, notes and the formatted date. */
function filterVoyages(voyages: LogEntry[], query: string): LogEntry[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return voyages
  return voyages.filter((entry) =>
    [entry.start, entry.goal, entry.crew, entry.description, formatDate(entry.date)].some((field) =>
      (field ?? '').toLowerCase().includes(needle),
    ),
  )
}
