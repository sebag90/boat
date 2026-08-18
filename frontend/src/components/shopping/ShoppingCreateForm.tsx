import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCreateShopping } from '../../api/shopping'
import { Dropzone } from '../dropzone/Dropzone'
import { Button, Field, InlineError, Spinner, TextArea, TextInput } from '../ui'

export function ShoppingCreateForm({ boatId }: { boatId: number }) {
  const { t } = useI18n()
  const create = useCreateShopping(boatId)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setError(null)
    try {
      await create.mutateAsync({ name: name.trim(), description, link: link.trim(), files })
      setName('')
      setDescription('')
      setLink('')
      setFiles([])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t('shopping.name')} · ${t('label.required')}`}>
          <TextInput
            value={name}
            required
            placeholder={t('shopping.namePlaceholder')}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label={t('shopping.link')}>
          <TextInput
            type="url"
            inputMode="url"
            value={link}
            placeholder="https://"
            onChange={(event) => setLink(event.target.value)}
          />
        </Field>
      </div>

      <Field label={t('label.description')} hint={t('label.markdownHint')}>
        <TextArea
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <Dropzone files={files} onChange={setFiles} />

      <InlineError message={error} />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={create.isPending || !name.trim()}
          icon={create.isPending ? <Spinner /> : <Plus className="size-4" />}
        >
          {create.isPending ? t('app.saving') : t('action.add')}
        </Button>
      </div>
    </form>
  )
}
