import { useMemo, useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useDocuments } from '../../api/documents'
import { formatDateTime } from '../../lib/format'
import type { DocumentEntry } from '../../lib/types'
import { AttachmentChip } from '../attachments/AttachmentChip'
import { EntryCard, EntryList, excerptOf } from '../entries/EntryCard'
import { FormPanel, ListPanel, TabHeading } from '../entries/TabScaffold'
import { EntryDetailDialog } from '../detail/EntryDetailDialog'
import { EmptyState, ErrorState, LoadingState, SearchInput } from '../ui'
import { DocumentCreateForm } from './DocumentCreateForm'

export function DocumentsTab({ boatId }: { boatId: number }) {
  const { t } = useI18n()
  const { data, isPending, error, refetch } = useDocuments(boatId)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<DocumentEntry | null>(null)

  const documents = data ?? []
  const filtered = useMemo(() => filterDocuments(documents, query), [documents, query])

  return (
    <>
      <TabHeading
        title={t('documents.title')}
        subtitle={t('documents.subtitle')}
        icon={<FolderOpen className="size-5" />}
      />

      <FormPanel title={t('documents.new')} icon={<FolderOpen className="size-4" />}>
        <DocumentCreateForm boatId={boatId} />
      </FormPanel>

      <ListPanel
        title={t('documents.title')}
        count={filtered.length}
        countLabel={t('documents.count')}
        search={
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t('documents.searchPlaceholder')}
          />
        }
      >
        {isPending ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState body={query ? t('documents.emptySearch') : t('documents.empty')} />
        ) : (
          <EntryList>
            {filtered.map((doc) => (
              <EntryCard
                key={doc.id}
                title={doc.title}
                onClick={() => setSelected(doc)}
                excerpt={excerptOf(doc.description)}
                meta={
                  <>
                    <span className="font-mono text-[0.7rem] text-navy-500">{formatDateTime(doc.uploaded_at)}</span>
                    <AttachmentChip filename={doc.filename} />
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
          type="document"
          entry={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

/** Case-insensitive local filter over title, description and filename. */
function filterDocuments(documents: DocumentEntry[], query: string): DocumentEntry[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return documents
  return documents.filter((doc) =>
    [doc.title, doc.description, doc.filename ?? ''].some((field) =>
      field.toLowerCase().includes(needle),
    ),
  )
}
