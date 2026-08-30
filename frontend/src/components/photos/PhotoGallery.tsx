import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderPlus,
  GripVertical,
  Pencil,
  Play,
  Tag,
  Trash2,
} from 'lucide-react'
import { usePhotos, type PhotoParent } from '../../api/photos'
import { useI18n } from '../../i18n'
import { attachmentUrl } from '../../lib/api'
import { cn } from '../../lib/cn'
import { isVideo } from '../../lib/format'
import type { Photo } from '../../lib/types'
import { Dropzone } from '../dropzone/Dropzone'
import { Badge, Button, Field, InlineError, Modal, Spinner, TextInput } from '../ui'

/** Reorderable picture gallery with album grouping: drop to upload, drag to sort, click to enlarge. */
export function PhotoGallery({ parent, parentId }: { parent: PhotoParent; parentId: number }) {
  const { t } = useI18n()
  const { photos, upload, updatePhoto, renameAlbum, remove, reorder } = usePhotos(parent, parentId)

  const [activeAlbum, setActiveAlbum] = useState<string | null>(null)
  const [createdAlbums, setCreatedAlbums] = useState<string[]>([])
  const [dragId, setDragId] = useState<number | null>(null)
  const [preview, setPreview] = useState<Photo[] | null>(null)
  const [viewIndex, setViewIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false)
  const [newAlbumInput, setNewAlbumInput] = useState('')
  const [renamingAlbum, setRenamingAlbum] = useState<string | null>(null)
  const [renameInput, setRenameInput] = useState('')
  const [movingPhoto, setMovingPhoto] = useState<Photo | null>(null)
  const [targetMoveAlbum, setTargetMoveAlbum] = useState<string>('')
  const [targetMoveCustom, setTargetMoveCustom] = useState<string>('')

  // Compute album list
  const albums = useMemo(() => {
    const set = new Set<string>()
    for (const p of photos) {
      const name = p.album?.trim()
      if (name) set.add(name)
    }
    for (const name of createdAlbums) {
      if (name.trim()) set.add(name.trim())
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [photos, createdAlbums])

  const uncategorizedCount = useMemo(
    () => photos.filter((p) => !p.album?.trim()).length,
    [photos],
  )

  const albumCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const name of albums) counts[name] = 0
    for (const p of photos) {
      const name = p.album?.trim()
      if (name && counts[name] !== undefined) counts[name]++
    }
    return counts
  }, [albums, photos])

  // Filtered photos for the active album
  const filteredPhotos = useMemo(() => {
    if (activeAlbum === null) return photos
    if (activeAlbum === '__uncategorized__') return photos.filter((p) => !p.album?.trim())
    return photos.filter((p) => p.album?.trim() === activeAlbum)
  }, [photos, activeAlbum])

  const shown = preview ?? filteredPhotos
  const viewing = viewIndex === null ? null : (shown[viewIndex] ?? null)

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

  function onFiles(files: File[]) {
    if (files.length === 0) return
    setError(null)
    const targetAlbum =
      activeAlbum === '__uncategorized__' || activeAlbum === null ? null : activeAlbum
    upload.mutate({ files, album: targetAlbum }, { onError: report })
  }

  function previewAt(target: number) {
    if (dragId === null) return
    setPreview((current) => {
      const list = current ?? filteredPhotos
      const from = list.findIndex((photo) => photo.id === dragId)
      if (from === -1 || from === target) return current
      const next = [...list]
      next.splice(target, 0, ...next.splice(from, 1))
      return next
    })
  }

  function commitOrder() {
    const orderedFiltered = preview
    setDragId(null)
    setPreview(null)
    if (!orderedFiltered) return

    if (activeAlbum === null) {
      if (orderedFiltered.every((photo, index) => photo.id === photos[index]?.id)) return
      setError(null)
      reorder.mutate(orderedFiltered, { onError: report })
      return
    }

    const remaining = [...orderedFiltered]
    const newFullList = photos.map((p) => {
      const isMember =
        activeAlbum === '__uncategorized__' ? !p.album?.trim() : p.album?.trim() === activeAlbum
      if (isMember) {
        return remaining.shift()!
      }
      return p
    })

    if (newFullList.every((photo, index) => photo.id === photos[index]?.id)) return
    setError(null)
    reorder.mutate(newFullList, { onError: report })
  }

  function handleCreateAlbum(e: React.FormEvent) {
    e.preventDefault()
    const name = newAlbumInput.trim()
    if (!name) return
    if (!createdAlbums.includes(name)) {
      setCreatedAlbums((prev) => [...prev, name])
    }
    setActiveAlbum(name)
    setNewAlbumInput('')
    setIsCreatingAlbum(false)
  }

  function handleRenameAlbum(e: React.FormEvent) {
    e.preventDefault()
    if (!renamingAlbum) return
    const newName = renameInput.trim()
    if (!newName || newName === renamingAlbum) {
      setRenamingAlbum(null)
      return
    }
    setError(null)
    renameAlbum.mutate(
      { oldName: renamingAlbum, newName },
      {
        onSuccess: () => {
          setCreatedAlbums((prev) => prev.map((a) => (a === renamingAlbum ? newName : a)))
          if (activeAlbum === renamingAlbum) setActiveAlbum(newName)
          setRenamingAlbum(null)
        },
        onError: report,
      },
    )
  }

  function handleMovePhoto(e: React.FormEvent) {
    e.preventDefault()
    if (!movingPhoto) return
    let album: string | null = null
    if (targetMoveAlbum === '__custom__') {
      const custom = targetMoveCustom.trim()
      album = custom || null
      if (custom && !createdAlbums.includes(custom)) {
        setCreatedAlbums((prev) => [...prev, custom])
      }
    } else if (targetMoveAlbum && targetMoveAlbum !== '__none__') {
      album = targetMoveAlbum
    }
    setError(null)
    updatePhoto.mutate(
      { id: movingPhoto.id, album },
      {
        onSuccess: () => setMovingPhoto(null),
        onError: report,
      },
    )
  }

  function openMoveModal(photo: Photo) {
    setMovingPhoto(photo)
    const currentAlbum = photo.album?.trim() ?? ''
    if (currentAlbum && albums.includes(currentAlbum)) {
      setTargetMoveAlbum(currentAlbum)
      setTargetMoveCustom('')
    } else if (currentAlbum) {
      setTargetMoveAlbum('__custom__')
      setTargetMoveCustom(currentAlbum)
    } else {
      setTargetMoveAlbum('__none__')
      setTargetMoveCustom('')
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[0.7rem] font-semibold tracking-[0.12em] text-brass-700 uppercase">
          {t('photos.title')} · {photos.length}
        </h3>

        <button
          type="button"
          onClick={() => {
            setNewAlbumInput('')
            setIsCreatingAlbum(true)
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-800 transition-colors hover:bg-ocean-100 hover:text-ocean-900"
        >
          <FolderPlus className="size-3.5" />
          {t('photos.newAlbum')}
        </button>
      </div>

      {/* Album filter tabs */}
      {(albums.length > 0 || uncategorizedCount > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveAlbum(null)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-all',
              activeAlbum === null
                ? 'bg-navy-950 text-white shadow-sm ring-1 ring-navy-950'
                : 'bg-white text-navy-700 ring-1 ring-navy-300 hover:bg-ocean-50',
            )}
          >
            {t('photos.all')} ({photos.length})
          </button>

          {albums.length > 0 && uncategorizedCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveAlbum('__uncategorized__')}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-all',
                activeAlbum === '__uncategorized__'
                  ? 'bg-navy-950 text-white shadow-sm ring-1 ring-navy-950'
                  : 'bg-white text-navy-700 ring-1 ring-navy-300 hover:bg-ocean-50',
              )}
            >
              {t('photos.uncategorized')} ({uncategorizedCount})
            </button>
          )}

          {albums.map((name) => {
            const isSelected = activeAlbum === name
            return (
              <div key={name} className="inline-flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveAlbum(name)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                    isSelected
                      ? 'bg-brass-600 text-white shadow-sm ring-1 ring-brass-600'
                      : 'bg-white text-navy-700 ring-1 ring-navy-300 hover:bg-ocean-50',
                  )}
                >
                  <Tag className="size-3 opacity-70" />
                  <span>{name}</span>
                  <span className="opacity-80">({albumCounts[name] ?? 0})</span>
                </button>
                {isSelected && (
                  <button
                    type="button"
                    onClick={() => {
                      setRenameInput(name)
                      setRenamingAlbum(name)
                    }}
                    title={t('photos.renameAlbum')}
                    aria-label={t('photos.renameAlbum')}
                    className="ml-1 rounded-full p-1 text-navy-500 hover:bg-ocean-100 hover:text-navy-900"
                  >
                    <Pencil className="size-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

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

              {/* Photo album badge or move button */}
              {photo.album?.trim() ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    openMoveModal(photo)
                  }}
                  title={t('photos.moveToAlbum')}
                  className="absolute bottom-1.5 left-1.5 inline-flex max-w-[calc(100%-12px)] items-center gap-1 truncate rounded-md bg-navy-950/80 px-2 py-0.5 text-[0.65rem] font-semibold text-brass-300 backdrop-blur transition-colors hover:bg-navy-950 hover:text-white"
                >
                  <Tag className="size-2.5 shrink-0" />
                  <span className="truncate">{photo.album}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    openMoveModal(photo)
                  }}
                  title={t('photos.moveToAlbum')}
                  className="absolute bottom-1.5 left-1.5 hidden items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[0.65rem] font-semibold text-navy-600 shadow-sm group-hover:inline-flex hover:bg-ocean-100 hover:text-navy-900"
                >
                  <Tag className="size-2.5" />
                  <span>{t('photos.moveToAlbum')}</span>
                </button>
              )}

              <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openMoveModal(photo)}
                  aria-label={t('photos.moveToAlbum')}
                  title={t('photos.moveToAlbum')}
                  className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-navy-600 shadow-sm transition-colors hover:bg-ocean-100 hover:text-ocean-900"
                >
                  <Tag className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(t('photos.confirmDelete'))) return
                    setError(null)
                    remove.mutate(photo.id, { onError: report })
                  }}
                  aria-label={t('action.delete')}
                  title={t('action.delete')}
                  className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-navy-500 shadow-sm transition-colors hover:bg-signal-600 hover:text-white"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-1">
        {activeAlbum && activeAlbum !== '__uncategorized__' && (
          <p className="text-xs font-semibold text-brass-800">
            {t('photos.uploadTo')}: <span className="font-bold text-navy-900">{activeAlbum}</span>
          </p>
        )}
        <Dropzone files={[]} onChange={onFiles} accept="image/*,video/*" label={t('photos.add')} />
      </div>

      {upload.isPending && (
        <p className="flex items-center gap-2 text-sm text-navy-600">
          <Spinner /> {t('photos.uploading')}
        </p>
      )}

      <InlineError message={error} />

      {/* Lightbox Modal */}
      {viewing && (
        <Modal
          open
          onClose={() => setViewIndex(null)}
          size="xl"
          eyebrow={`${activeAlbum && activeAlbum !== '__uncategorized__' ? activeAlbum : t('photos.title')} · ${(viewIndex ?? 0) + 1}/${shown.length}`}
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
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {viewing.album?.trim() ? (
                <Badge tone="brass" icon={<Tag className="size-3" />}>
                  {viewing.album}
                </Badge>
              ) : null}
              <button
                type="button"
                onClick={() => openMoveModal(viewing)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ocean-800 hover:underline"
              >
                <Tag className="size-3.5" />
                {t('photos.moveToAlbum')}
              </button>
            </div>
            <a
              href={attachmentUrl(`/api/photos/${viewing.id}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-800 hover:underline"
            >
              <ExternalLink className="size-4" /> {t('action.open')}
            </a>
          </div>
        </Modal>
      )}

      {/* Create Album Dialog */}
      {isCreatingAlbum && (
        <Modal
          open
          onClose={() => setIsCreatingAlbum(false)}
          size="sm"
          title={t('photos.newAlbum')}
        >
          <form onSubmit={handleCreateAlbum} className="space-y-4">
            <Field label={t('photos.albumName')}>
              <TextInput
                placeholder="e.g. Front cabin, Back cabin, Engine..."
                value={newAlbumInput}
                onChange={(e) => setNewAlbumInput(e.target.value)}
                autoFocus
                required
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsCreatingAlbum(false)}>
                {t('action.cancel')}
              </Button>
              <Button type="submit" variant="primary">
                {t('photos.createAlbum')}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Rename Album Dialog */}
      {renamingAlbum && (
        <Modal
          open
          onClose={() => setRenamingAlbum(null)}
          size="sm"
          title={t('photos.renameAlbum')}
        >
          <form onSubmit={handleRenameAlbum} className="space-y-4">
            <Field label={t('photos.albumName')}>
              <TextInput
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                autoFocus
                required
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRenamingAlbum(null)}>
                {t('action.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={renameAlbum.isPending}>
                {renameAlbum.isPending ? <Spinner /> : t('action.save')}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Move Photo to Album Dialog */}
      {movingPhoto && (
        <Modal
          open
          onClose={() => setMovingPhoto(null)}
          size="sm"
          title={t('photos.moveToAlbum')}
        >
          <form onSubmit={handleMovePhoto} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-navy-800">
                <input
                  type="radio"
                  name="album"
                  value="__none__"
                  checked={targetMoveAlbum === '__none__'}
                  onChange={() => setTargetMoveAlbum('__none__')}
                  className="size-4 accent-navy-950"
                />
                <span>{t('photos.noAlbum')}</span>
              </label>

              {albums.map((name) => (
                <label key={name} className="flex items-center gap-2 text-sm text-navy-800">
                  <input
                    type="radio"
                    name="album"
                    value={name}
                    checked={targetMoveAlbum === name}
                    onChange={() => setTargetMoveAlbum(name)}
                    className="size-4 accent-navy-950"
                  />
                  <span>{name}</span>
                </label>
              ))}

              <label className="flex items-center gap-2 text-sm text-navy-800">
                <input
                  type="radio"
                  name="album"
                  value="__custom__"
                  checked={targetMoveAlbum === '__custom__'}
                  onChange={() => setTargetMoveAlbum('__custom__')}
                  className="size-4 accent-navy-950"
                />
                <span>{t('photos.newAlbum')}...</span>
              </label>

              {targetMoveAlbum === '__custom__' && (
                <div className="pt-2 pl-6">
                  <TextInput
                    placeholder="e.g. Front cabin..."
                    value={targetMoveCustom}
                    onChange={(e) => setTargetMoveCustom(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setMovingPhoto(null)}>
                {t('action.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={updatePhoto.isPending}>
                {updatePhoto.isPending ? <Spinner /> : t('action.save')}
              </Button>
            </div>
          </form>
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
