import { useEffect, useRef, useState, type DragEvent } from 'react'
import { UploadCloud } from 'lucide-react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import { isImage } from '../../lib/format'
import { FileTile } from './FileTile'

interface DropzoneProps {
  files: File[]
  onChange: (files: File[]) => void
  /** Multiple appends selections; single keeps only the newest file. */
  multiple?: boolean
  accept?: string
  label?: string
  className?: string
}

export function Dropzone({
  files,
  onChange,
  multiple = true,
  accept = 'image/*,.pdf,.doc,.docx',
  label,
  className,
}: DropzoneProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const previews = useObjectUrls(files)

  const accept_ = accept || undefined

  function merge(incoming: File[]) {
    if (incoming.length === 0) return
    onChange(multiple ? [...files, ...incoming] : [incoming[incoming.length - 1]])
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    merge(Array.from(event.dataTransfer.files))
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed',
          'px-5 py-7 text-center transition-all duration-200 ease-sail',
          dragging
            ? 'border-brass-500 bg-brass-100 ring-4 ring-brass-200'
            : 'border-navy-300 bg-navy-50/60 hover:border-brass-400 hover:bg-brass-50',
        )}
      >
        <UploadCloud className={cn('size-7', dragging ? 'text-brass-700' : 'text-navy-400')} />
        <p className="text-sm font-semibold text-navy-900">
          {label ?? (multiple ? t('dropzone.title') : t('dropzone.single'))}
        </p>
        {multiple && <p className="text-xs text-navy-500">{t('dropzone.subtitle')}</p>}
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept_}
          onChange={(event) => {
            merge(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[0.7rem] font-semibold tracking-[0.08em] text-navy-600 uppercase">
              {t('dropzone.selected')} · {files.length}
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-signal-600 hover:text-signal-700 hover:underline"
            >
              {t('action.clearAll')}
            </button>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {files.map((file, index) => (
              <FileTile
                key={`${file.name}-${file.lastModified}-${index}`}
                file={file}
                previewUrl={previews[index]}
                onRemove={() => onChange(files.filter((_, i) => i !== index))}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/** Creates image thumbnails and revokes them on change/unmount. */
function useObjectUrls(files: File[]): (string | undefined)[] {
  const [urls, setUrls] = useState<(string | undefined)[]>([])

  useEffect(() => {
    const created = files.map((file) =>
      isImage(file.name, file.type) ? URL.createObjectURL(file) : undefined,
    )
    setUrls(created)
    return () => {
      for (const url of created) if (url) URL.revokeObjectURL(url)
    }
  }, [files])

  return urls
}
