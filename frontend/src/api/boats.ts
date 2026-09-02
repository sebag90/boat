import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Boat } from '../lib/types'
import { queryKeys } from './queryKeys'

export function useBoats() {
  return useQuery({
    queryKey: queryKeys.boats,
    queryFn: () => api.get<Boat[]>('/api/boats'),
    retry: false,
  })
}

export function useCreateBoat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; location?: string }) =>
      api.postJson<Boat>('/api/boats', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.boats }),
  })
}

export function useUpdateBoat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: number
      name: string
      description?: string
      location?: string
    }) => api.putJson<Boat>(`/api/boats/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.boats }),
  })
}

export function useDeleteBoat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/boats/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.boats }),
  })
}
