import { useMemo, useState } from 'react'
import { ExternalLink, ShoppingCart } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useShopping, useUpdateShopping } from '../../api/shopping'
import { formatDateTime } from '../../lib/format'
import type { ShoppingEntry } from '../../lib/types'
import { AttachmentChip } from '../attachments/AttachmentChip'
import { EntryCard, EntryList, excerptOf } from '../entries/EntryCard'
import { FormPanel, ListPanel, TabHeading } from '../entries/TabScaffold'
import { EntryDetailDialog } from '../detail/EntryDetailDialog'
import { Badge, CheckToggle, EmptyState, ErrorState, LoadingState, SearchInput } from '../ui'
import { ShoppingCreateForm } from './ShoppingCreateForm'

export function ShoppingTab({ boatId }: { boatId: number }) {
  const { t } = useI18n()
  const { data, isPending, error, refetch } = useShopping(boatId)
  const toggle = useUpdateShopping(boatId)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ShoppingEntry | null>(null)

  const items = data ?? []
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) =>
      [item.name, item.description, item.link].some((field) =>
        (field ?? '').toLowerCase().includes(needle),
      ),
    )
  }, [items, query])

  const openCount = items.filter((item) => !item.done).length

  return (
    <>
      <TabHeading
        title={t('shopping.title')}
        subtitle={t('shopping.subtitle')}
        icon={<ShoppingCart className="size-5" />}
        aside={
          <>
            <Badge tone="neutral">{`${openCount} ${t('status.toBuy')}`}</Badge>
            <Badge tone="foam">{`${items.length - openCount} ${t('status.purchased')}`}</Badge>
          </>
        }
      />

      <FormPanel title={t('shopping.new')} icon={<ShoppingCart className="size-4" />}>
        <ShoppingCreateForm boatId={boatId} />
      </FormPanel>

      <ListPanel
        title={t('shopping.title')}
        count={filtered.length}
        search={
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t('shopping.searchPlaceholder')}
          />
        }
      >
        {isPending ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState body={t('shopping.empty')} />
        ) : (
          <EntryList>
            {filtered.map((item) => (
              <EntryCard
                key={item.id}
                muted={item.done}
                onClick={() => setSelected(item)}
                title={item.name}
                excerpt={excerptOf(item.description)}
                meta={
                  <>
                    <span className="font-mono text-[0.7rem] text-navy-500">{formatDateTime(item.created_at)}</span>
                    <AttachmentChip filename={item.file_filename} />
                  </>
                }
                leading={
                  <CheckToggle
                    checked={item.done}
                    label={t('status.purchased')}
                    disabled={toggle.isPending}
                    onChange={(done) => toggle.mutate({ id: item.id, done })}
                  />
                }
                trailing={
                  item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      title={t('shopping.openLink')}
                      aria-label={t('shopping.openLink')}
                      onClick={(event) => event.stopPropagation()}
                      className="flex size-8 items-center justify-center rounded-lg text-ocean-700 hover:bg-ocean-600 hover:text-white"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  ) : undefined
                }
              />
            ))}
          </EntryList>
        )}
      </ListPanel>

      {selected && (
        <EntryDetailDialog
          boatId={boatId}
          type="shopping"
          entry={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
