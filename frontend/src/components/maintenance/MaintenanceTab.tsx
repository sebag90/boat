import { useMemo, useState } from 'react'
import { Images, Wrench } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useMaintenance } from '../../api/maintenance'
import { formatDate } from '../../lib/format'
import type { MaintenanceEntry } from '../../lib/types'
import { AttachmentChip } from '../attachments/AttachmentChip'
import { EntryCard, EntryList, excerptOf } from '../entries/EntryCard'
import { FormPanel, ListPanel, TabHeading } from '../entries/TabScaffold'
import { EntryDetailDialog } from '../detail/EntryDetailDialog'
import { Badge, EmptyState, ErrorState, LoadingState, SearchInput } from '../ui'
import { MaintenanceCreateForm } from './MaintenanceCreateForm'

export function MaintenanceTab({ boatId }: { boatId: number }) {
  const { t } = useI18n()
  const { data, isPending, error, refetch } = useMaintenance(boatId)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<MaintenanceEntry | null>(null)

  const records = data ?? []
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return records
    return records.filter((record) =>
      [record.title, record.description, formatDate(record.date), record.receipt_filename ?? ''].some(
        (field) => field.toLowerCase().includes(needle),
      ),
    )
  }, [records, query])

  return (
    <>
      <TabHeading
        title={t('maintenance.title')}
        subtitle={t('maintenance.subtitle')}
        icon={<Wrench className="size-5" />}
      />

      <FormPanel title={t('maintenance.new')} icon={<Wrench className="size-4" />}>
        <MaintenanceCreateForm boatId={boatId} />
      </FormPanel>

      <ListPanel
        title={t('maintenance.title')}
        count={filtered.length}
        countLabel={t('maintenance.count')}
        search={
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t('maintenance.searchPlaceholder')}
          />
        }
      >
        {isPending ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState body={t('maintenance.empty')} />
        ) : (
          <EntryList>
            {filtered.map((record) => (
              <EntryCard
                key={record.id}
                onClick={() => setSelected(record)}
                /* Preview format is strictly "date - title" (spec §3.5). */
                title={`${formatDate(record.date)} - ${record.title}`}
                excerpt={excerptOf(record.description)}
                meta={
                  <>
                    <Badge tone="ocean">{formatDate(record.date)}</Badge>
                    {record.photo_count > 0 && (
                      <Badge tone="brass" icon={<Images className="size-3" />}>
                        {record.photo_count} {t('photos.title')}
                      </Badge>
                    )}
                    <AttachmentChip filename={record.receipt_filename} />
                  </>
                }
              />
            ))}
          </EntryList>
        )}
      </ListPanel>

      {selected && (
        <EntryDetailDialog
          boatId={boatId}
          type="maintenance"
          entry={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
