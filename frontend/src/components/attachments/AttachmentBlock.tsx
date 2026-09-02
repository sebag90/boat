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
      <h3 className="label-caps text-on-surface-variant font-semibold">
        {label ?? t('label.attachment')}
      </h3>

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3.5 rounded-2xl border border-outline-variant/30 bg-surface-container-low/70 p-3.5 transition-all hover:bg-surface-container-low hover:border-secondary/40 shadow-xs"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-secondary shadow-xs">
          {pdf ? (
            <FileText className="size-5 text-error" />
          ) : image ? (
            <ImageIcon className="size-5 text-secondary" />
          ) : video ? (
            <Film className="size-5 text-secondary" />
          ) : (
            <Paperclip className="size-5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-primary">{filename}</span>
          <span className="text-xs text-on-surface-variant">{t('action.open')}</span>
        </span>
        <ExternalLink className="size-4 shrink-0 text-outline group-hover:text-secondary transition-colors" />
      </a>

      {pdf && (
        <iframe
          src={href}
          title={filename}
          className="h-[65vh] max-h-[560px] w-full rounded-2xl bg-white border border-outline-variant/30 shadow-xs"
        />
      )}

      {image && (
        <a href={href} target="_blank" rel="noreferrer" className="block">
          <img
            src={href}
            alt={filename}
            className="max-h-[520px] w-full rounded-2xl bg-white object-contain border border-outline-variant/30 shadow-xs"
          />
        </a>
      )}

      {video && (
        <video
          src={href}
          controls
          className="max-h-[520px] w-full rounded-2xl bg-black shadow-xs"
        />
      )}
    </section>
  )
}
