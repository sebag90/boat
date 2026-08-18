import { useState } from 'react'
import { Anchor, Crosshair } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCreateLog } from '../../api/logbook'
import { currentPosition, type Fix } from '../../lib/geolocation'
import { localIsoTimestamp, todayInputValue } from '../../lib/format'
import type { LogEntry } from '../../lib/types'
import { Button, InlineError, Modal, Spinner } from '../ui'
import { VoyageFormFields, type VoyageDraft } from './VoyageFormFields'

interface CreateVoyageDialogProps {
  boatId: number
  onClose: () => void
  onCreated: (entry: LogEntry) => void
}

const EMPTY: VoyageDraft = { date: '', crew: '', start: '', goal: '', description: '' }

export function CreateVoyageDialog({ boatId, onClose, onCreated }: CreateVoyageDialogProps) {
  const { t } = useI18n()
  const create = useCreateLog(boatId)
  const [draft, setDraft] = useState<VoyageDraft>({ ...EMPTY, date: todayInputValue() })
  const [fix, setFix] = useState<Fix | null>(null)
  const [locating, setLocating] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function captureStart() {
    setLocating(true)
    setGpsError(null)
    try {
      setFix(await currentPosition())
    } catch (cause) {
      setGpsError(cause instanceof Error ? cause.message : t('app.error'))
    } finally {
      setLocating(false)
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!draft.date) return
    setError(null)
    try {
      const entry = await create.mutateAsync({
        ...draft,
        waypoints: fix
          ? [
              {
                latitude: fix.latitude,
                longitude: fix.longitude,
                timestamp: localIsoTimestamp(),
                name: draft.start ? `Start: ${draft.start}` : 'Start Waypoint',
              },
            ]
          : [],
      })
      onCreated(entry)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      eyebrow={t('logbook.title')}
      title={t('logbook.new')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={create.isPending}>
            {t('action.cancel')}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={create.isPending || !draft.date}
            icon={create.isPending ? <Spinner /> : <Anchor className="size-4" />}
          >
            {create.isPending ? t('app.saving') : t('logbook.create')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <VoyageFormFields
          draft={draft}
          onChange={(patch) => setDraft((value) => ({ ...value, ...patch }))}
        />

        <div className="space-y-2 rounded-2xl bg-ocean-50/70 p-4 ring-1 ring-ocean-100">
          <Button
            variant="secondary"
            onClick={captureStart}
            disabled={locating}
            icon={locating ? <Spinner /> : <Crosshair className="size-4" />}
          >
            {locating ? t('logbook.capturing') : t('logbook.captureStart')}
          </Button>
          {fix && (
            <p className="font-mono text-xs text-foam-600">
              ✓ {t('logbook.startCaptured')}: {fix.latitude.toFixed(5)}, {fix.longitude.toFixed(5)}
            </p>
          )}
          <InlineError message={gpsError} />
        </div>

        <InlineError message={error} />
      </form>
    </Modal>
  )
}
