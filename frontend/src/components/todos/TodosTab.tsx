import { useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useTodos, useUpdateTodo } from '../../api/todos'
import { formatDateTime } from '../../lib/format'
import type { TodoEntry } from '../../lib/types'
import { AttachmentChip } from '../attachments/AttachmentChip'
import { EntryCard, EntryList } from '../entries/EntryCard'
import { FormPanel, ListPanel, TabHeading } from '../entries/TabScaffold'
import { EntryDetailDialog } from '../detail/EntryDetailDialog'
import { Badge, CheckToggle, EmptyState, ErrorState, LoadingState, SearchInput } from '../ui'
import { TodoCreateForm } from './TodoCreateForm'

export function TodosTab({ boatId }: { boatId: number }) {
  const { t } = useI18n()
  const { data, isPending, error, refetch } = useTodos(boatId)
  const toggle = useUpdateTodo(boatId)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<TodoEntry | null>(null)

  const todos = data ?? []
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return todos
    return todos.filter((todo) => todo.text.toLowerCase().includes(needle))
  }, [todos, query])

  const openCount = todos.filter((todo) => !todo.done).length

  return (
    <>
      <TabHeading
        title={t('todos.title')}
        subtitle={t('todos.subtitle')}
        icon={<ClipboardList className="size-5" />}
        aside={
          <>
            <Badge tone="brass">{`${openCount} ${t('todos.open')}`}</Badge>
            <Badge tone="foam">{`${todos.length - openCount} ${t('todos.doneCount')}`}</Badge>
          </>
        }
      />

      <FormPanel title={t('todos.new')} icon={<ClipboardList className="size-4" />}>
        <TodoCreateForm boatId={boatId} />
      </FormPanel>

      <ListPanel
        title={t('todos.title')}
        count={filtered.length}
        search={
          <SearchInput value={query} onChange={setQuery} placeholder={t('todos.searchPlaceholder')} />
        }
      >
        {isPending ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState body={t('todos.empty')} />
        ) : (
          <EntryList>
            {filtered.map((todo) => (
              <EntryCard
                key={todo.id}
                muted={todo.done}
                onClick={() => setSelected(todo)}
                title={firstLine(todo.text)}
                meta={
                  <>
                    <span className="text-navy-400">{formatDateTime(todo.created_at)}</span>
                    <AttachmentChip filename={todo.file_filename} />
                  </>
                }
                leading={
                  <CheckToggle
                    checked={todo.done}
                    label={t('status.done')}
                    disabled={toggle.isPending}
                    onChange={(done) => toggle.mutate({ id: todo.id, done })}
                  />
                }
              />
            ))}
          </EntryList>
        )}
      </ListPanel>

      {selected && (
        <EntryDetailDialog
          boatId={boatId}
          type="todo"
          entry={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

function firstLine(text: string): string {
  return text.split('\n')[0] || text
}
