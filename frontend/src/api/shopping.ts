import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, appendFiles } from '../lib/api'
import type { ShoppingEntry } from '../lib/types'
import { queryKeys } from './queryKeys'

export function useShopping(boatId: number | null) {
  return useQuery({
    queryKey: queryKeys.shopping(boatId ?? 0),
    queryFn: () => api.get<ShoppingEntry[]>(`/api/boats/${boatId}/shopping`),
    enabled: boatId !== null,
  })
}

export function useCreateShopping(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draft: { name: string; description: string; link: string; files: File[] }) => {
      const form = new FormData()
      form.append('name', draft.name)
      form.append('description', draft.description)
      form.append('link', draft.link)
      appendFiles(form, draft.files, 'file')
      return api.postForm<ShoppingEntry>(`/api/boats/${boatId}/shopping`, form)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.shopping(boatId) }),
  })
}

/** Partial update: only the provided fields are sent. */
export function useUpdateShopping(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: number
      name?: string
      description?: string
      link?: string
      done?: boolean
      file?: File | null
    }) => {
      const form = new FormData()
      if (input.name !== undefined) form.append('name', input.name)
      if (input.description !== undefined) form.append('description', input.description)
      if (input.link !== undefined) form.append('link', input.link)
      if (input.done !== undefined) form.append('done', String(input.done))
      if (input.file) form.append('file', input.file)
      return api.putForm<ShoppingEntry>(`/api/shopping/${input.id}`, form)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.shopping(boatId) }),
  })
}

export function useDeleteShopping(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/shopping/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.shopping(boatId) }),
  })
}
