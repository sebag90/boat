import type { TranslationKey } from '../../i18n'
import { formatDate, formatDateTime } from '../../lib/format'
import type {
  DocumentEntry,
  EntryType,
  MaintenanceEntry,
  ShoppingEntry,
  TodoEntry,
} from '../../lib/types'

type Translate = (key: TranslationKey) => string

export interface EntryBadge {
  label: string
  tone: 'navy' | 'ocean' | 'brass' | 'foam' | 'signal' | 'neutral'
}

export interface EntryPresentation {
  eyebrow: string
  title: string
  badges: EntryBadge[]
  description: string
  link?: string
  attachment?: { path: string; filename: string | null; contentType: string | null; label: string }
}

/** Normalizes the four record types into one read-only presentation shape. */
export function presentEntry(
  type: EntryType,
  entry: DocumentEntry | MaintenanceEntry | TodoEntry | ShoppingEntry,
  t: Translate,
): EntryPresentation {
  switch (type) {
    case 'document': {
      const doc = entry as DocumentEntry
      return {
        eyebrow: t('documents.title'),
        title: doc.title,
        badges: [{ label: `${t('label.uploaded')} ${formatDateTime(doc.uploaded_at)}`, tone: 'neutral' }],
        description: doc.description,
        attachment: {
          path: `/api/documents/${doc.id}/download`,
          filename: doc.filename,
          contentType: doc.content_type,
          label: t('label.attachment'),
        },
      }
    }
    case 'maintenance': {
      const record = entry as MaintenanceEntry
      return {
        eyebrow: t('maintenance.title'),
        title: record.title || t('label.title'),
        badges: [
          { label: formatDate(record.date), tone: 'ocean' },
          { label: `${t('label.created')} ${formatDateTime(record.created_at)}`, tone: 'neutral' },
        ],
        description: record.description,
        attachment: {
          path: `/api/maintenance/${record.id}/receipt`,
          filename: record.receipt_filename,
          contentType: null,
          label: t('maintenance.receipt'),
        },
      }
    }
    case 'todo': {
      const todo = entry as TodoEntry
      return {
        eyebrow: t('todos.title'),
        title: todo.text.split('\n')[0] || todo.text,
        badges: [
          todo.done
            ? { label: t('status.completed'), tone: 'foam' }
            : { label: t('status.pending'), tone: 'neutral' },
          { label: `${t('label.created')} ${formatDateTime(todo.created_at)}`, tone: 'neutral' },
        ],
        description: todo.text,
        attachment: {
          path: `/api/todos/${todo.id}/file`,
          filename: todo.file_filename,
          contentType: todo.file_content_type,
          label: t('label.attachment'),
        },
      }
    }
    case 'shopping': {
      const item = entry as ShoppingEntry
      return {
        eyebrow: t('shopping.title'),
        title: item.name,
        badges: [
          item.done
            ? { label: t('status.purchased'), tone: 'foam' }
            : { label: t('status.toBuy'), tone: 'neutral' },
          { label: `${t('label.created')} ${formatDateTime(item.created_at)}`, tone: 'neutral' },
        ],
        description: item.description,
        link: item.link || undefined,
        attachment: {
          path: `/api/shopping/${item.id}/file`,
          filename: item.file_filename,
          contentType: item.file_content_type,
          label: t('label.attachment'),
        },
      }
    }
  }
}
