import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCreateDocument } from '../../api/documents'
import { Dropzone } from '../dropzone/Dropzone'
import { Button, Field, InlineError, Spinner, TextArea, TextInput } from '../ui'

export function DocumentCreateForm({ boatId }: { boatId: number }) {
  const { t } = useI18n()
  const create = useCreateDocument(boatId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await create.mutateAsync({ title: title.trim(), description, files })
      setTitle('')
      setDescription('')
      setFiles([])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('label.title')}>
          <TextInput
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('documents.new')}
          />
        </Field>
        <Field label={t('label.description')} hint={t('label.markdownHint')}>
          <TextArea
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </div>

      <Dropzone files={files} onChange={setFiles} accept="image/*,.pdf,.doc,.docx,.txt" />

      <InlineError message={error} />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={create.isPending}
          icon={create.isPending ? <Spinner /> : <Plus className="size-4" />}
        >
          {create.isPending ? t('app.saving') : t('action.add')}
        </Button>
      </div>
    </form>
  )
}
