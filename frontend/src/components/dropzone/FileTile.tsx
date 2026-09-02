import { FileText, Film, Image as ImageIcon, Paperclip, X } from 'lucide-react'
import { formatFileSize, isImage, isPdf, isVideo } from '../../lib/format'
import { useI18n } from '../../i18n'

interface FileTileProps {
  file: File
  previewUrl?: string
  onRemove: () => void
}

export function FileTile({ file, previewUrl, onRemove }: FileTileProps) {
  const { t } = useI18n()
  const image = isImage(file.name, file.type)
  const video = isVideo(file.name, file.type)

  return (
    <li className="group relative flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-2.5 shadow-xs">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container-high text-on-surface-variant">
        {image && previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : isPdf(file.name) ? (
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
        <span className="block truncate text-sm font-semibold text-primary">{file.name}</span>
        <span className="text-xs text-on-surface-variant">{formatFileSize(file.size)}</span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('action.remove')}
        title={t('action.remove')}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error hover:text-white cursor-pointer"
      >
        <X className="size-4" />
      </button>
    </li>
  )
}
