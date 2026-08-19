import { useRef, useState } from 'react'
import { Crosshair, Play, Radio, Square, Upload } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useAutoTracker, TRACKER_INTERVALS } from '../../hooks/useAutoTracker'
import { formatTime, localIsoTimestamp } from '../../lib/format'
import type { Fix } from '../../lib/geolocation'
import { Button, Field, InlineError, Select, Spinner } from '../ui'

interface GpsPanelProps {
  onFix: (fix: Fix) => Promise<void>
  onImport: (file: File) => Promise<number>
}

/** Manual capture, bulk import and the interval auto-tracker (spec §3.3.1–3). */
export function GpsPanel({ onFix, onImport }: GpsPanelProps) {
  const { t } = useI18n()
  const tracker = useAutoTracker({ onFix })
  const fileRef = useRef<HTMLInputElement>(null)
  const [capturing, setCapturing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  async function captureNow() {
    setCapturing(true)
    await tracker.captureOnce()
    setCapturing(false)
  }

  async function importFile(file: File) {
    setImporting(true)
    setImportMessage(null)
    setImportError(null)
    try {
      const count = await onImport(file)
      setImportMessage(count === 0 ? t('voyage.importEmpty') : `${count} ${t('voyage.importDone')}`)
    } catch (cause) {
      setImportError(cause instanceof Error ? cause.message : t('app.error'))
    } finally {
      setImporting(false)
    }
  }

  return (
    <section className="space-y-3 rounded-2xl bg-ocean-100/70 p-4 ring-1 ring-ocean-300">
      <h3 className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-ocean-900 uppercase">
        <Radio className="size-3.5" />
        {t('voyage.gps')}
      </h3>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={captureNow}
          disabled={capturing || tracker.running}
          icon={capturing ? <Spinner /> : <Crosshair className="size-4" />}
        >
          {capturing ? t('logbook.capturing') : t('voyage.addHere')}
        </Button>

        <Button
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          icon={importing ? <Spinner /> : <Upload className="size-4" />}
        >
          {t('voyage.importFile')}
        </Button>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept=".jsonl,.json,.csv,.tsv,.txt"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void importFile(file)
          }}
        />
      </div>

      <p className="text-xs text-navy-600">{t('voyage.importHint')}</p>
      {importMessage && <p className="text-xs font-semibold text-foam-700">{importMessage}</p>}
      <InlineError message={importError} />

      <div className="rounded-xl bg-white p-3.5 ring-1 ring-navy-200">
        <div className="flex flex-wrap items-end gap-3">
          <Field label={t('voyage.tracker')} className="w-32">
            <Select
              value={tracker.interval}
              disabled={tracker.running}
              onChange={(event) =>
                tracker.setInterval(Number(event.target.value) as (typeof TRACKER_INTERVALS)[number])
              }
            >
              {TRACKER_INTERVALS.map((seconds) => (
                <option key={seconds} value={seconds}>
                  {seconds / 60} {t('voyage.min')}
                </option>
              ))}
            </Select>
          </Field>

          {tracker.running ? (
            <Button variant="danger" onClick={tracker.stop} icon={<Square className="size-4" />}>
              {t('voyage.stop')}
            </Button>
          ) : (
            <Button
              variant="brass"
              onClick={() => void tracker.start()}
              icon={<Play className="size-4" />}
            >
              {t('voyage.start')}
            </Button>
          )}

          {tracker.running && (
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal-500/70" />
                <span className="relative inline-flex size-2.5 rounded-full bg-signal-500" />
              </span>
              <span className="font-semibold text-navy-800">
                {t('voyage.nextIn')} {tracker.countdown}s
              </span>
            </div>
          )}
        </div>

        <p className="mt-2 text-xs text-navy-600">{t('voyage.trackerHint')}</p>
        {tracker.lastFixAt && (
          <p className="mt-1 text-xs font-medium text-navy-700">
            {t('voyage.lastFix')}: {formatTime(localIsoTimestamp(tracker.lastFixAt))}
          </p>
        )}
        <div className="mt-2">
          <InlineError message={tracker.error} />
        </div>
      </div>
    </section>
  )
}
