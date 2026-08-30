import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Photo } from '../lib/types'
import { queryKeys } from './queryKeys'

/** `maintenance` = service job, `logbook` = voyage. */
export type PhotoParent = 'maintenance' | 'logbook'

export interface PhotoUploadInput {
  files: File[]
  album?: string | null
}

/** List / upload / delete the pictures of one maintenance record or voyage. */
export function usePhotos(parent: PhotoParent, parentId: number) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.photos(parent, parentId)
  const path = `/api/${parent}/${parentId}/photos`
  /** Parent lists carry a `photo_count`, so they are refreshed too (prefix match: all boats). */
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey })
    queryClient.invalidateQueries({ queryKey: [parent] })
  }

  const list = useQuery({ queryKey, queryFn: () => api.get<Photo[]>(path) })

  const upload = useMutation({
    mutationFn: (input: File[] | PhotoUploadInput) => {
      const files = Array.isArray(input) ? input : input.files
      const album = Array.isArray(input) ? null : input.album
      const form = new FormData()
      for (const file of files) form.append('files', file)
      if (album && album.trim()) form.append('album', album.trim())
      return api.postForm<Photo[]>(path, form)
    },
    onSuccess,
  })

  const updatePhoto = useMutation({
    mutationFn: ({ id, album }: { id: number; album: string | null }) =>
      api.patchJson<Photo>(`/api/photos/${id}`, { album }),
    onSuccess,
  })

  const renameAlbum = useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      api.putJson<{ ok: boolean }>(`${path}/albums`, { old_name: oldName, new_name: newName }),
    onSuccess,
  })

  const remove = useMutation({
    mutationFn: (id: number) => api.del(`/api/photos/${id}`),
    onSuccess,
  })

  /** Persists a new display order; the cache is updated straight away. */
  const reorder = useMutation({
    mutationFn: (ordered: Photo[]) => {
      queryClient.setQueryData<Photo[]>(queryKey, ordered)
      return api.putJson<{ ok: boolean }>('/api/photos/order', ordered.map((photo) => photo.id))
    },
    onSettled: onSuccess,
  })

  return { photos: list.data ?? [], loading: list.isPending, upload, updatePhoto, renameAlbum, remove, reorder }
}
