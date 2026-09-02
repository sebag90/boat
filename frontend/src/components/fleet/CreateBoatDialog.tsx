import { useState } from 'react'
import { Sailboat } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCreateBoat } from '../../api/boats'
import type { Boat } from '../../lib/types'
import { Button, Field, InlineError, LocationInput, Modal, Spinner, TextArea, TextInput } from '../ui'

interface CreateBoatDialogProps {
  onClose: () => void
  onCreated: (boat: Boat) => void
}

export function CreateBoatDialog({ onClose, onCreated }: CreateBoatDialogProps) {
  const { t } = useI18n()
  const create = useCreateBoat()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setError(null)
    try {
      onCreated(
        await create.mutateAsync({
          name: name.trim(),
          description,
          location: location.trim(),
        }),
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      eyebrow={t('app.fleet')}
      title={t('fleet.registerTitle')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={create.isPending}>
            {t('action.cancel')}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={create.isPending || !name.trim()}
            icon={create.isPending ? <Spinner /> : <Sailboat className="size-4" />}
          >
            {create.isPending ? t('app.saving') : t('fleet.register')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label={`${t('fleet.name')} · ${t('label.required')}`}>
          <TextInput
            value={name}
            required
            autoFocus
            placeholder={t('fleet.namePlaceholder')}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field label={t('fleet.location')}>
          <LocationInput
            value={location}
            placeholder={t('fleet.locationPlaceholder')}
            onChange={setLocation}
          />
        </Field>

        <Field label={t('fleet.description')}>
          <TextArea
            rows={3}
            value={description}
            placeholder={t('fleet.descriptionPlaceholder')}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <InlineError message={error} />
      </form>
    </Modal>
  )
}
