import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { LogEntry, LogEntryInput, Waypoint, WaypointInput } from '../lib/types'
import { queryKeys } from './queryKeys'

function byDateDesc(entries: LogEntry[]): LogEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))
}

export function useLogbook(boatId: number | null) {
  return useQuery({
    queryKey: queryKeys.logbook(boatId ?? 0),
    queryFn: async () => byDateDesc(await api.get<LogEntry[]>(`/api/boats/${boatId}/logbook`)),
    enabled: boatId !== null,
  })
}

/** Mutates the cached voyage list in place — keeps the open dialog in sync. */
function useLogCache(boatId: number) {
  const queryClient = useQueryClient()
  const key = queryKeys.logbook(boatId)
  return {
    prepend: (entry: LogEntry) =>
      queryClient.setQueryData<LogEntry[]>(key, (current) => byDateDesc([entry, ...(current ?? [])])),
    replace: (entry: LogEntry) =>
      queryClient.setQueryData<LogEntry[]>(key, (current) =>
        byDateDesc((current ?? []).map((item) => (item.id === entry.id ? entry : item))),
      ),
    remove: (id: number) =>
      queryClient.setQueryData<LogEntry[]>(key, (current) =>
        (current ?? []).filter((item) => item.id !== id),
      ),
    patchWaypoints: (id: number, update: (waypoints: Waypoint[]) => Waypoint[]) =>
      queryClient.setQueryData<LogEntry[]>(key, (current) =>
        (current ?? []).map((item) =>
          item.id === id ? { ...item, waypoints: update(item.waypoints ?? []) } : item,
        ),
      ),
    invalidate: () => queryClient.invalidateQueries({ queryKey: key }),
  }
}

export function useCreateLog(boatId: number) {
  const cache = useLogCache(boatId)
  return useMutation({
    mutationFn: (payload: LogEntryInput) =>
      api.postJson<LogEntry>(`/api/boats/${boatId}/logbook`, payload),
    onSuccess: (entry) => cache.prepend(entry),
  })
}

export function useUpdateLog(boatId: number) {
  const cache = useLogCache(boatId)
  return useMutation({
    mutationFn: ({ id, ...payload }: LogEntryInput & { id: number }) =>
      api.putJson<LogEntry>(`/api/logbook/${id}`, payload),
    onSuccess: (entry) => cache.replace(entry),
  })
}

export function useDeleteLog(boatId: number) {
  const cache = useLogCache(boatId)
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/logbook/${id}`),
    onSuccess: (_result, id) => cache.remove(id),
  })
}

export function useAddWaypoint(boatId: number) {
  const cache = useLogCache(boatId)
  return useMutation({
    mutationFn: ({ entryId, ...payload }: WaypointInput & { entryId: number }) =>
      api.postJson<Waypoint>(`/api/logbook/${entryId}/waypoints`, payload),
    onSuccess: (waypoint, variables) =>
      cache.patchWaypoints(variables.entryId, (waypoints) => [...waypoints, waypoint]),
  })
}

export function useImportWaypoints(boatId: number) {
  const cache = useLogCache(boatId)
  return useMutation({
    mutationFn: ({ entryId, file }: { entryId: number; file: File }) => {
      const form = new FormData()
      form.append('file', file)
      return api.postForm<Waypoint[]>(`/api/logbook/${entryId}/waypoints/import`, form)
    },
    onSuccess: (imported, variables) => {
      if (imported.length === 0) return
      cache.patchWaypoints(variables.entryId, (waypoints) =>
        [...waypoints, ...imported].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      )
    },
  })
}

export function useDeleteWaypoint(boatId: number) {
  const cache = useLogCache(boatId)
  return useMutation({
    mutationFn: ({ id }: { id: number; entryId: number }) => api.del(`/api/waypoints/${id}`),
    onSuccess: (_result, variables) =>
      cache.patchWaypoints(variables.entryId, (waypoints) =>
        waypoints.filter((wp) => wp.id !== variables.id),
      ),
  })
}
