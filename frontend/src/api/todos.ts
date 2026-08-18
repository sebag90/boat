import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, appendFiles } from '../lib/api'
import type { TodoEntry } from '../lib/types'
import { queryKeys } from './queryKeys'

export function useTodos(boatId: number | null) {
  return useQuery({
    queryKey: queryKeys.todos(boatId ?? 0),
    queryFn: () => api.get<TodoEntry[]>(`/api/boats/${boatId}/todos`),
    enabled: boatId !== null,
  })
}

export function useCreateTodo(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draft: { text: string; files: File[] }) => {
      const form = new FormData()
      form.append('text', draft.text)
      appendFiles(form, draft.files, 'file')
      return api.postForm<TodoEntry>(`/api/boats/${boatId}/todos`, form)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos(boatId) }),
  })
}

/** Partial update: only the provided fields are sent. */
export function useUpdateTodo(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: number; text?: string; done?: boolean; file?: File | null }) => {
      const form = new FormData()
      if (input.text !== undefined) form.append('text', input.text)
      if (input.done !== undefined) form.append('done', String(input.done))
      if (input.file) form.append('file', input.file)
      return api.putForm<TodoEntry>(`/api/todos/${input.id}`, form)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos(boatId) }),
  })
}

export function useDeleteTodo(boatId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/todos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos(boatId) }),
  })
}
