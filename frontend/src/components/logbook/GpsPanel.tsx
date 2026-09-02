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
    <section className="space-y-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 p-5 shadow-xs">
      <h3 className="flex items-center gap-2 label-caps text-on-surface-variant font-semibold">
        <Radio className="size-4 text-secondary" />
        {t('voyage.gps')}
      </h3>

      <div className="flex flex-wrap gap-2.5">
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
          accept=".jsonl,.ndjson,.json,.csv,.tsv,.txt"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) importFile(file)
            event.target.value = ''
          }}
        />
      </div>

      {importMessage && (
        <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-800 border border-emerald-500/20">
          ✓ {importMessage}
        </p>
      )}
      <InlineError message={importError || tracker.error} />

      <div className="border-t border-outline-variant/20 pt-4">
        <div className="flex flex-wrap items-end gap-3">
          <Field label={t('voyage.tracker')} hint={t('voyage.trackerHint')} className="min-w-[12rem]">
            <Select
              value={tracker.interval}
              disabled={tracker.running}
              onChange={(event) => tracker.setInterval(Number(event.target.value) as any)}
            >
              {TRACKER_INTERVALS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec / 60} {t('voyage.min')}
                </option>
              ))}
            </Select>
          </Field>

          {tracker.running ? (
            <Button
              variant="danger"
              onClick={tracker.stop}
              icon={<Square className="size-3.5 fill-current" />}
            >
              {t('voyage.stop')}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={tracker.start}
              icon={<Play className="size-3.5 fill-current" />}
            >
              {t('voyage.start')}
            </Button>
          )}

          {tracker.running && (
            <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
              <span className="inline-flex size-2 animate-ping rounded-full bg-secondary" />
              <span>
                {t('voyage.nextIn')} <strong className="font-mono text-primary font-bold">{tracker.countdown}s</strong>
              </span>
              {tracker.lastFixAt && (
                <span>
                  · {t('voyage.lastFix')}: {formatTime(localIsoTimestamp(tracker.lastFixAt))}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
