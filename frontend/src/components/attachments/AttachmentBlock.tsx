import { ExternalLink, FileText, Film, Image as ImageIcon, Paperclip } from 'lucide-react'
import { useI18n } from '../../i18n'
import { attachmentUrl } from '../../lib/api'
import { isImage, isPdf, isVideo } from '../../lib/format'

interface AttachmentBlockProps {
  filename?: string | null
  contentType?: string | null
  /** API path of the download route, e.g. `/api/documents/12/download`. */
  path: string
  label?: string
}

/**
 * Read-only attachment viewer: filename card + open action, inline PDF iframe
 * and image preview (spec §3.4). Rendering is gated on `filename`.
 */
export function AttachmentBlock({ filename, contentType, path, label }: AttachmentBlockProps) {
  const { t } = useI18n()
  if (!filename) return null

  const href = attachmentUrl(path)
  const pdf = isPdf(filename)
  const image = isImage(filename, contentType)
  const video = isVideo(filename, contentType)

  return (
    <section className="space-y-3">
      <h3 className="label-mono text-navy-600">
        {label ?? t('label.attachment')}
      </h3>

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 rounded-card border border-navy-200 bg-white p-3 transition-shadow hover:shadow-chart"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded bg-tint-strong text-navy-900">
          {pdf ? (
            <FileText className="size-5 text-signal-600" />
          ) : image ? (
            <ImageIcon className="size-5 text-ocean-700" />
          ) : video ? (
            <Film className="size-5 text-ocean-700" />
          ) : (
            <Paperclip className="size-5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-navy-900">{filename}</span>
          <span className="text-xs text-navy-500">{t('action.open')}</span>
        </span>
        <ExternalLink className="size-4 shrink-0 text-navy-400 transition-colors group-hover:text-navy-800" />
      </a>

      {pdf && (
        <iframe
          src={href}
          title={filename}
          className="h-[65vh] max-h-[560px] w-full rounded-xl bg-white border border-navy-200"
        />
      )}

      {image && (
        <a href={href} target="_blank" rel="noreferrer" className="block">
          <img
            src={href}
            alt={filename}
            className="max-h-[520px] w-full rounded-xl bg-white object-contain border border-navy-200"
          />
        </a>
      )}

      {video && (
        <video
          src={href}
          controls
          playsInline
          className="max-h-[520px] w-full rounded-xl bg-black object-contain border border-navy-200"
        />
      )}
    </section>
  )
}
