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
    <li className="group relative flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-navy-200 shadow-sm">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-navy-100 text-navy-500">
        {image && previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : isPdf(file.name) ? (
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
        <span className="block truncate text-sm font-medium text-navy-900">{file.name}</span>
        <span className="text-xs text-navy-500">{formatFileSize(file.size)}</span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('action.remove')}
        title={t('action.remove')}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-signal-600 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </li>
  )
}
