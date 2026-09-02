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
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed',
          'px-6 py-8 text-center transition-all duration-200',
          dragging
            ? 'border-secondary bg-secondary-fixed/30'
            : 'border-outline-variant/50 bg-surface-container-low/40 hover:border-secondary/40 hover:bg-surface-container-low',
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-xl bg-secondary-fixed text-secondary shadow-xs">
          <UploadCloud className="size-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">
            {label ?? (multiple ? t('dropzone.title') : t('dropzone.single'))}
          </p>
          {multiple && (
            <p className="text-xs text-on-surface-variant mt-0.5">{t('dropzone.subtitle')}</p>
          )}
        </div>
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
        <div className="mt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="label-caps text-on-surface-variant font-semibold">
              {t('dropzone.selected')} · {files.length}
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-error hover:underline cursor-pointer"
            >
              {t('action.clearAll')}
            </button>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {files.map((file, index) => (
              <FileTile
                key={`${file.name}-${file.size}-${index}`}
                file={file}
                previewUrl={previews[index] ?? undefined}
                onRemove={() => onChange(files.filter((_, i) => i !== index))}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function useObjectUrls(files: File[]): (string | null)[] {
  const [urls, setUrls] = useState<(string | null)[]>([])

  useEffect(() => {
    const list = files.map((file) => (isImage(file.name, file.type) ? URL.createObjectURL(file) : null))
    setUrls(list)
    return () => {
      list.forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [files])

  return urls
}
