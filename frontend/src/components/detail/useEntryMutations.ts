import {
  useDeleteDocument,
  useDeleteDocumentFile,
  useUpdateDocument,
} from '../../api/documents'
import {
  useDeleteMaintenance,
  useDeleteMaintenanceReceipt,
  useUpdateMaintenance,
} from '../../api/maintenance'
import {
  useDeleteShopping,
  useDeleteShoppingFile,
  useUpdateShopping,
} from '../../api/shopping'
import {
  useDeleteTodo,
  useDeleteTodoFile,
  useUpdateTodo,
} from '../../api/todos'
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
  removeFile?: boolean
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

  const deleteDocumentFile = useDeleteDocumentFile(boatId)
  const deleteMaintenanceReceipt = useDeleteMaintenanceReceipt(boatId)
  const deleteTodoFile = useDeleteTodoFile(boatId)
  const deleteShoppingFile = useDeleteShoppingFile(boatId)

  async function update(type: EntryType, id: number, draft: EntryDraft): Promise<AnyEntry> {
    switch (type) {
      case 'document':
        return updateDocument.mutateAsync({
          id,
          title: draft.title,
          description: draft.description,
          file: draft.file,
          removeFile: draft.removeFile,
        })
      case 'maintenance':
        return updateMaintenance.mutateAsync({
          id,
          title: draft.title,
          date: draft.date,
          description: draft.description,
          file: draft.file,
          removeFile: draft.removeFile,
        })
      case 'todo':
        return updateTodo.mutateAsync({
          id,
          text: draft.text,
          done: draft.done,
          file: draft.file,
          removeFile: draft.removeFile,
        })
      case 'shopping':
        return updateShopping.mutateAsync({
          id,
          name: draft.name,
          description: draft.description,
          link: draft.link,
          done: draft.done,
          file: draft.file,
          removeFile: draft.removeFile,
        })
    }
  }

  async function removeAttachment(type: EntryType, id: number): Promise<AnyEntry> {
    switch (type) {
      case 'document':
        return deleteDocumentFile.mutateAsync(id)
      case 'maintenance':
        return deleteMaintenanceReceipt.mutateAsync(id)
      case 'todo':
        return deleteTodoFile.mutateAsync(id)
      case 'shopping':
        return deleteShoppingFile.mutateAsync(id)
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
    deleteShopping.isPending ||
    deleteDocumentFile.isPending ||
    deleteMaintenanceReceipt.isPending ||
    deleteTodoFile.isPending ||
    deleteShoppingFile.isPending

  return { update, remove, removeAttachment, saving, deleting }
}
