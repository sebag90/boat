import { FileText, Image as ImageIcon, Paperclip, X } from 'lucide-react'
import { formatFileSize, isImage, isPdf } from '../../lib/format'
import { useI18n } from '../../i18n'

interface FileTileProps {
  file: File
  previewUrl?: string
  onRemove: () => void
}

export function FileTile({ file, previewUrl, onRemove }: FileTileProps) {
  const { t } = useI18n()
  const image = isImage(file.name, file.type)

  return (
    <li className="group relative flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-navy-100 shadow-sm">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-navy-50 text-navy-400">
        {image && previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : isPdf(file.name) ? (
          <FileText className="size-5 text-signal-500" />
        ) : image ? (
          <ImageIcon className="size-5 text-ocean-500" />
        ) : (
          <Paperclip className="size-5" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-navy-800">{file.name}</span>
        <span className="text-xs text-navy-400">{formatFileSize(file.size)}</span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('action.remove')}
        title={t('action.remove')}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-navy-300 transition-colors hover:bg-signal-500/10 hover:text-signal-600"
      >
        <X className="size-4" />
      </button>
    </li>
  )
}
