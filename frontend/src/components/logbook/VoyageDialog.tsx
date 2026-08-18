import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import {
  useAddWaypoint,
  useDeleteLog,
  useDeleteWaypoint,
  useImportWaypoints,
  useUpdateLog,
} from '../../api/logbook'
import { formatDate, localIsoTimestamp } from '../../lib/format'
import type { Fix } from '../../lib/geolocation'
import type { LogEntry, Waypoint } from '../../lib/types'
import { Button, InlineError, Modal, Spinner } from '../ui'
import { VoyageFormFields, type VoyageDraft } from './VoyageFormFields'
import { VoyageReadView } from './VoyageReadView'

interface VoyageDialogProps {
  boatId: number
  entry: LogEntry
  onClose: () => void
}

function draftFrom(entry: LogEntry): VoyageDraft {
  return {
    date: entry.date,
    crew: entry.crew ?? '',
    start: entry.start ?? '',
    goal: entry.goal ?? '',
    description: entry.description ?? '',
  }
}

export function VoyageDialog({ boatId, entry, onClose }: VoyageDialogProps) {
  const { t } = useI18n()
  const updateLog = useUpdateLog(boatId)
  const deleteLog = useDeleteLog(boatId)
  const addWaypoint = useAddWaypoint(boatId)
  const importWaypoints = useImportWaypoints(boatId)
  const deleteWaypoint = useDeleteWaypoint(boatId)

  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState(() => draftFrom(entry))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!editMode) setDraft(draftFrom(entry))
  }, [entry, editMode])

  /** Metadata updates must resend the waypoint list: PUT replaces it wholesale. */
  async function onSave() {
    setError(null)
    try {
      await updateLog.mutateAsync({
        id: entry.id,
        ...draft,
        waypoints: (entry.waypoints ?? []).map((wp) => ({
          latitude: Number(wp.latitude),
          longitude: Number(wp.longitude),
          timestamp: wp.timestamp,
          name: wp.name,
        })),
      })
      setEditMode(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  async function onDelete() {
    if (!window.confirm(t('confirm.deleteVoyage'))) return
    setError(null)
    try {
      await deleteLog.mutateAsync(entry.id)
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  async function onFix(fix: Fix) {
    await addWaypoint.mutateAsync({
      entryId: entry.id,
      latitude: fix.latitude,
      longitude: fix.longitude,
      timestamp: localIsoTimestamp(),
    })
  }

  async function onImport(file: File): Promise<number> {
    const imported = await importWaypoints.mutateAsync({ entryId: entry.id, file })
    return imported.length
  }

  function onDeleteWaypoint(waypoint: Waypoint) {
    if (!window.confirm(t('confirm.deleteWaypoint'))) return
    deleteWaypoint.mutate({ id: waypoint.id, entryId: entry.id })
  }

  const routeTitle = [entry.start, entry.goal].filter(Boolean).join(' → ') || t('voyage.title')

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      eyebrow={`${t('voyage.title')} · ${formatDate(entry.date)}`}
      title={routeTitle}
      footer={
        editMode ? (
          <>
            <Button variant="ghost" onClick={() => setEditMode(false)} disabled={updateLog.isPending}>
              {t('action.cancel')}
            </Button>
            <Button
              onClick={onSave}
              disabled={updateLog.isPending || !draft.date}
              icon={updateLog.isPending ? <Spinner /> : undefined}
            >
              {updateLog.isPending ? t('app.saving') : t('action.save')}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={onDelete}
              disabled={deleteLog.isPending}
              className="mr-auto text-signal-600 hover:bg-signal-500/10"
              icon={deleteLog.isPending ? <Spinner /> : <Trash2 className="size-4" />}
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
      <div className="space-y-4">
        <InlineError message={error} />
        {editMode ? (
          <VoyageFormFields
            draft={draft}
            onChange={(patch) => setDraft((value) => ({ ...value, ...patch }))}
          />
        ) : (
          <VoyageReadView
            entry={entry}
            onFix={onFix}
            onImport={onImport}
            onDeleteWaypoint={onDeleteWaypoint}
            deletingWaypoint={deleteWaypoint.isPending}
          />
        )}
      </div>
    </Modal>
  )
}
