import { useEffect, useState } from 'react'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import type {
  AnyEntry,
  DocumentEntry,
  EntryType,
  MaintenanceEntry,
  ShoppingEntry,
  TodoEntry,
} from '../../lib/types'
import { AttachmentBlock } from '../attachments/AttachmentBlock'
import { Markdown } from '../Markdown'
import { Badge, Button, InlineError, Modal, Spinner } from '../ui'
import { EntryEditForm } from './EntryEditForm'
import { presentEntry } from './entryPresenter'
import { useEntryMutations, type EntryDraft } from './useEntryMutations'

interface EntryDetailDialogProps {
  boatId: number
  type: EntryType
  entry: AnyEntry
  onClose: () => void
}

function draftFrom(type: EntryType, entry: AnyEntry): EntryDraft {
  const doc = entry as DocumentEntry
  const record = entry as MaintenanceEntry
  const todo = entry as TodoEntry
  const item = entry as ShoppingEntry
  return {
    title: type === 'document' ? doc.title : type === 'maintenance' ? record.title : '',
    name: type === 'shopping' ? item.name : '',
    text: type === 'todo' ? todo.text : '',
    date: type === 'maintenance' ? record.date : '',
    description:
      type === 'document' || type === 'maintenance' || type === 'shopping'
        ? ((entry as DocumentEntry).description ?? '')
        : '',
    link: type === 'shopping' ? (item.link ?? '') : '',
    done: type === 'todo' || type === 'shopping' ? Boolean((entry as TodoEntry).done) : false,
    file: null,
  }
}

/** Read-only first, edit only on explicit "Modify" (spec §4.2). */
export function EntryDetailDialog({ boatId, type, entry, onClose }: EntryDetailDialogProps) {
  const { t } = useI18n()
  const { update, remove, saving, deleting } = useEntryMutations(boatId)
  const [current, setCurrent] = useState(entry)
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState(() => draftFrom(type, entry))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrent(entry)
    setEditMode(false)
    setDraft(draftFrom(type, entry))
  }, [entry, type])

  const view = presentEntry(type, current, t)

  async function onSave() {
    setError(null)
    try {
      const updated = await update(type, current.id, draft)
      setCurrent(updated)
      setDraft(draftFrom(type, updated))
      setEditMode(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  async function onDelete() {
    if (!window.confirm(t('confirm.deleteEntry'))) return
    setError(null)
    try {
      await remove(type, current.id)
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      eyebrow={view.eyebrow}
      title={view.title}
      footer={
        editMode ? (
          <>
            <Button variant="ghost" onClick={() => setEditMode(false)} disabled={saving}>
              {t('action.cancel')}
            </Button>
            <Button onClick={onSave} disabled={saving} icon={saving ? <Spinner /> : undefined}>
              {saving ? t('app.saving') : t('action.save')}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={onDelete}
              disabled={deleting}
              className="mr-auto text-signal-700 hover:bg-signal-600 hover:text-white"
              icon={deleting ? <Spinner /> : <Trash2 className="size-4" />}
            >
              {t('action.delete')}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              {t('action.close')}
            </Button>
            <Button onClick={() => setEditMode(true)} icon={<Pencil className="size-4" />}>
              {t('action.modify')}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {view.badges.map((badge) => (
            <Badge key={badge.label} tone={badge.tone}>
              {badge.label}
            </Badge>
          ))}
        </div>

        <InlineError message={error} />

        {editMode ? (
          <EntryEditForm
            type={type}
            draft={draft}
            onChange={(patch) => setDraft((value) => ({ ...value, ...patch }))}
          />
        ) : (
          <>
            {view.link && (
              <a
                href={view.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-2 rounded-xl bg-ocean-100 px-3.5 py-2.5 text-sm font-semibold text-ocean-900 ring-1 ring-ocean-400 hover:bg-ocean-200"
              >
                <ExternalLink className="size-4 shrink-0" />
                <span className="truncate">{view.link}</span>
              </a>
            )}

            <Markdown source={view.description} fallback={undefined} />

            {view.attachment?.filename ? (
              <AttachmentBlock
                path={view.attachment.path}
                filename={view.attachment.filename}
                contentType={view.attachment.contentType}
                label={view.attachment.label}
              />
            ) : (
              <p className="text-sm font-medium text-navy-500 italic">{t('label.noAttachment')}</p>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
