import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCreateMaintenance } from '../../api/maintenance'
import { todayInputValue } from '../../lib/format'
import { Dropzone } from '../dropzone/Dropzone'
import { Button, Field, InlineError, Spinner, TextArea, TextInput } from '../ui'

export function MaintenanceCreateForm({ boatId }: { boatId: number }) {
  const { t } = useI18n()
  const create = useCreateMaintenance(boatId)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayInputValue)
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await create.mutateAsync({ title: title.trim(), date, description, files })
      setTitle('')
      setDate(todayInputValue())
      setDescription('')
      setFiles([])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t('label.title')} className="sm:col-span-2">
          <TextInput
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('maintenance.new')}
          />
        </Field>
        <Field label={`${t('label.date')} · ${t('label.required')}`}>
          <TextInput
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
      </div>

      <Field label={t('label.description')} hint={t('label.markdownHint')}>
        <TextArea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <Dropzone files={files} onChange={setFiles} label={t('maintenance.receipt')} />

      <InlineError message={error} />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={create.isPending || !date}
          icon={create.isPending ? <Spinner /> : <Plus className="size-4" />}
        >
          {create.isPending ? t('app.saving') : t('action.add')}
        </Button>
      </div>
    </form>
  )
}
