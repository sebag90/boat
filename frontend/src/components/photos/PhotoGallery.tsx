import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, GripVertical, Play, Trash2 } from 'lucide-react'
import { usePhotos, type PhotoParent } from '../../api/photos'
import { useI18n } from '../../i18n'
import { attachmentUrl } from '../../lib/api'
import { cn } from '../../lib/cn'
import { isVideo } from '../../lib/format'
import type { Photo } from '../../lib/types'
import { Dropzone } from '../dropzone/Dropzone'
import { InlineError, Modal, Spinner } from '../ui'

/** Reorderable picture gallery: drop to upload, drag to sort, click to enlarge. */
export function PhotoGallery({ parent, parentId }: { parent: PhotoParent; parentId: number }) {
  const { t } = useI18n()
  const { photos, upload, remove, reorder } = usePhotos(parent, parentId)
  const [dragId, setDragId] = useState<number | null>(null)
  /** Live preview order while a drag is in flight; null = whatever the server says. */
  const [preview, setPreview] = useState<Photo[] | null>(null)
  const [viewIndex, setViewIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const shown = preview ?? photos
  const viewing = viewIndex === null ? null : (shown[viewIndex] ?? null)

  /** Wraps around, so the gallery is a loop in both directions. */
  function step(delta: number) {
    setViewIndex((current) =>
      current === null || shown.length === 0 ? current : (current + delta + shown.length) % shown.length,
    )
  }

  useEffect(() => {
    if (viewIndex === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      step(event.key === 'ArrowLeft' ? -1 : 1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [viewIndex, shown.length])

  function report(cause: unknown) {
    setError(cause instanceof Error ? cause.message : t('app.error'))
  }

  /** Dropping files uploads them immediately — no separate confirm step. */
  function onFiles(files: File[]) {
    if (files.length === 0) return
    setError(null)
    upload.mutate(files, { onError: report })
  }

  /** Slides the dragged picture into `target` right away, so the grid reflows live. */
  function previewAt(target: number) {
    if (dragId === null) return
    setPreview((current) => {
      const list = current ?? photos
      const from = list.findIndex((photo) => photo.id === dragId)
      if (from === -1 || from === target) return current
      const next = [...list]
      next.splice(target, 0, ...next.splice(from, 1))
      return next
    })
  }

  /** One commit point: dragend fires after a drop and after a cancelled drag alike. */
  function commitOrder() {
    const ordered = preview
    setDragId(null)
    setPreview(null)
    if (!ordered || ordered.every((photo, index) => photo.id === photos[index]?.id)) return
    setError(null)
    reorder.mutate(ordered, { onError: report })
  }

  return (
    <section className="space-y-3">
      <h3 className="text-[0.7rem] font-semibold tracking-[0.12em] text-brass-700 uppercase">
        {t('photos.title')} · {photos.length}
      </h3>

      {shown.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {shown.map((photo, index) => (
            <li
              key={photo.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move'
                setDragId(photo.id)
              }}
              onDragEnd={commitOrder}
              onDragEnter={() => previewAt(index)}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              className={cn(
                'group relative cursor-grab overflow-hidden rounded-xl ring-1 ring-navy-300',
                dragId === photo.id && 'ring-2 ring-brass-500 opacity-60',
              )}
            >
              <button type="button" onClick={() => setViewIndex(index)} className="block w-full">
                {isVideo(photo.filename, photo.content_type) ? (
                  <div className="relative h-32 w-full bg-navy-950">
                    <video
                      src={`${attachmentUrl(`/api/photos/${photo.id}`)}#t=0.1`}
                      preload="metadata"
                      muted
                      playsInline
                      className="size-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-navy-950/30 text-white transition-colors group-hover:bg-navy-950/10">
                      <Play className="size-8 fill-white/90 text-white drop-shadow" />
                    </span>
                  </div>
                ) : (
                  <img
                    src={attachmentUrl(`/api/photos/${photo.id}`)}
                    alt={photo.filename}
                    loading="lazy"
                    draggable={false}
                    className="h-32 w-full bg-white object-cover"
                  />
                )}
              </button>
              <span className="absolute top-1.5 left-1.5 flex size-7 items-center justify-center rounded-lg bg-white/90 text-navy-400 shadow-sm">
                <GripVertical className="size-4" />
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(t('photos.confirmDelete'))) return
                  setError(null)
                  remove.mutate(photo.id, { onError: report })
                }}
                aria-label={t('action.delete')}
                title={t('action.delete')}
                className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-lg bg-white/90 text-navy-500 shadow-sm transition-colors hover:bg-signal-600 hover:text-white"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dropzone files={[]} onChange={onFiles} accept="image/*,video/*" label={t('photos.add')} />

      {upload.isPending && (
        <p className="flex items-center gap-2 text-sm text-navy-600">
          <Spinner /> {t('photos.uploading')}
        </p>
      )}

      <InlineError message={error} />

      {viewing && (
        <Modal
          open
          onClose={() => setViewIndex(null)}
          size="xl"
          eyebrow={`${t('photos.title')} · ${(viewIndex ?? 0) + 1}/${shown.length}`}
          title={viewing.filename}
        >
          <div className="relative">
            {isVideo(viewing.filename, viewing.content_type) ? (
              <video
                key={viewing.id}
                src={attachmentUrl(`/api/photos/${viewing.id}`)}
                controls
                autoPlay
                playsInline
                className="max-h-[75dvh] w-full rounded-xl bg-black object-contain"
              />
            ) : (
              <img
                src={attachmentUrl(`/api/photos/${viewing.id}`)}
                alt={viewing.filename}
                className="max-h-[75dvh] w-full rounded-xl bg-navy-950 object-contain"
              />
            )}
            {shown.length > 1 && (
              <>
                <ArrowButton side="left" label={t('photos.previous')} onClick={() => step(-1)} />
                <ArrowButton side="right" label={t('photos.next')} onClick={() => step(1)} />
              </>
            )}
          </div>
          <a
            href={attachmentUrl(`/api/photos/${viewing.id}`)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ocean-800 hover:underline"
          >
            <ExternalLink className="size-4" /> {t('action.open')}
          </a>
        </Modal>
      )}
    </section>
  )
}

function ArrowButton({
  side,
  label,
  onClick,
}: {
  side: 'left' | 'right'
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full',
        'bg-white/85 text-navy-800 shadow-float transition-colors hover:bg-white',
        side === 'left' ? 'left-2' : 'right-2',
      )}
    >
      {side === 'left' ? <ChevronLeft className="size-6" /> : <ChevronRight className="size-6" />}
    </button>
  )
}
