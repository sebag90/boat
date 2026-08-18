import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, appendFiles } from '../lib/api'
import type { MaintenanceEntry } from '../lib/types'
import { queryKeys } from './queryKeys'

/** Newest service jobs first (defensive re-sort on top of the backend order). */
function byDateDesc(records: MaintenanceEntry[]): MaintenanceEntry[] {
  return [...records].sort((a, b) => b.date.localeCompare(a.date))
}

export function useMaintenance(boatId: number | null) {
  return useQuery({
    queryKey: queryKeys.maintenance(boatId ?? 0),
    queryFn: async () => byDateDesc(await api.get<MaintenanceEntry[]>(`/api/boats/${boatId}/maintenance`)),
    enabled: boatId !== null,
  })
}

export interface MaintenanceDraft {
  title: string
  date: string
  description: string
  files: File[]
}

export function useCreateMaintenance(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draft: MaintenanceDraft) => {
      const form = new FormData()
      form.append('title', draft.title)
      form.append('date', draft.date)
      form.append('description', draft.description)
      appendFiles(form, draft.files, 'receipt')
      return api.postForm<MaintenanceEntry>(`/api/boats/${boatId}/maintenance`, form)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.maintenance(boatId) }),
  })
}

export function useUpdateMaintenance(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: number
      title: string
      date: string
      description: string
      file: File | null
    }) => {
      const form = new FormData()
      form.append('title', input.title)
      form.append('date', input.date)
      form.append('description', input.description)
      if (input.file) form.append('receipt', input.file)
      return api.putForm<MaintenanceEntry>(`/api/maintenance/${input.id}`, form)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.maintenance(boatId) }),
  })
}

export function useDeleteMaintenance(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/maintenance/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.maintenance(boatId) }),
  })
}
