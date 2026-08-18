import { useDeleteDocument, useUpdateDocument } from '../../api/documents'
import { useDeleteMaintenance, useUpdateMaintenance } from '../../api/maintenance'
import { useDeleteShopping, useUpdateShopping } from '../../api/shopping'
import { useDeleteTodo, useUpdateTodo } from '../../api/todos'
import type { AnyEntry, EntryType } from '../../lib/types'

/** Unified edit draft — each form only touches the fields it owns. */
export interface EntryDraft {
  title: string
  name: string
  text: string
  date: string
  description: string
  link: string
  done: boolean
  file: File | null
}

export function useEntryMutations(boatId: number) {
  const updateDocument = useUpdateDocument(boatId)
  const updateMaintenance = useUpdateMaintenance(boatId)
  const updateTodo = useUpdateTodo(boatId)
  const updateShopping = useUpdateShopping(boatId)

  const deleteDocument = useDeleteDocument(boatId)
  const deleteMaintenance = useDeleteMaintenance(boatId)
  const deleteTodo = useDeleteTodo(boatId)
  const deleteShopping = useDeleteShopping(boatId)

  async function update(type: EntryType, id: number, draft: EntryDraft): Promise<AnyEntry> {
    switch (type) {
      case 'document':
        return updateDocument.mutateAsync({
          id,
          title: draft.title,
          description: draft.description,
          file: draft.file,
        })
      case 'maintenance':
        return updateMaintenance.mutateAsync({
          id,
          title: draft.title,
          date: draft.date,
          description: draft.description,
          file: draft.file,
        })
      case 'todo':
        return updateTodo.mutateAsync({ id, text: draft.text, done: draft.done, file: draft.file })
      case 'shopping':
        return updateShopping.mutateAsync({
          id,
          name: draft.name,
          description: draft.description,
          link: draft.link,
          done: draft.done,
          file: draft.file,
        })
    }
  }

  async function remove(type: EntryType, id: number): Promise<void> {
    switch (type) {
      case 'document':
        await deleteDocument.mutateAsync(id)
        return
      case 'maintenance':
        await deleteMaintenance.mutateAsync(id)
        return
      case 'todo':
        await deleteTodo.mutateAsync(id)
        return
      case 'shopping':
        await deleteShopping.mutateAsync(id)
        return
    }
  }

  const saving =
    updateDocument.isPending ||
    updateMaintenance.isPending ||
    updateTodo.isPending ||
    updateShopping.isPending

  const deleting =
    deleteDocument.isPending ||
    deleteMaintenance.isPending ||
    deleteTodo.isPending ||
    deleteShopping.isPending

  return { update, remove, saving, deleting }
}
