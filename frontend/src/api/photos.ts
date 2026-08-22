import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Photo } from '../lib/types'
import { queryKeys } from './queryKeys'

/** `maintenance` = service job, `logbook` = voyage. */
export type PhotoParent = 'maintenance' | 'logbook'

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
    mutationFn: (files: File[]) => {
      const form = new FormData()
      for (const file of files) form.append('files', file)
      return api.postForm<Photo[]>(path, form)
    },
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

  return { photos: list.data ?? [], loading: list.isPending, upload, remove, reorder }
}
