import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCreateTodo } from '../../api/todos'
import { Dropzone } from '../dropzone/Dropzone'
import { Button, Field, InlineError, Spinner, TextArea } from '../ui'

export function TodoCreateForm({ boatId }: { boatId: number }) {
  const { t } = useI18n()
  const create = useCreateTodo(boatId)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    setError(null)
    try {
      await create.mutateAsync({ text: text.trim(), files })
      setText('')
      setFiles([])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label={`${t('todos.text')} · ${t('label.required')}`} hint={t('label.markdownHint')}>
        <TextArea
          rows={2}
          value={text}
          required
          placeholder={t('todos.placeholder')}
          onChange={(event) => setText(event.target.value)}
        />
      </Field>

      <Dropzone files={files} onChange={setFiles} />

      <InlineError message={error} />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={create.isPending || !text.trim()}
          icon={create.isPending ? <Spinner /> : <Plus className="size-4" />}
        >
          {create.isPending ? t('app.saving') : t('action.add')}
        </Button>
      </div>
    </form>
  )
}
