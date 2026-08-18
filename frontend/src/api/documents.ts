import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, appendFiles } from '../lib/api'
import type { DocumentEntry } from '../lib/types'
import { queryKeys } from './queryKeys'

export function useDocuments(boatId: number | null) {
  return useQuery({
    queryKey: queryKeys.documents(boatId ?? 0),
    queryFn: () => api.get<DocumentEntry[]>(`/api/boats/${boatId}/documents`),
    enabled: boatId !== null,
  })
}

export interface DocumentDraft {
  title: string
  description: string
  files: File[]
}

export function useCreateDocument(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draft: DocumentDraft) => {
      const form = new FormData()
      form.append('title', draft.title)
      form.append('description', draft.description)
      appendFiles(form, draft.files, 'file')
      return api.postForm<DocumentEntry>(`/api/boats/${boatId}/documents`, form)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents(boatId) }),
  })
}

export function useUpdateDocument(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: number; title: string; description: string; file: File | null }) => {
      const form = new FormData()
      form.append('title', input.title)
      form.append('description', input.description)
      if (input.file) form.append('file', input.file)
      return api.putForm<DocumentEntry>(`/api/documents/${input.id}`, form)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents(boatId) }),
  })
}

export function useDeleteDocument(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents(boatId) }),
  })
}
