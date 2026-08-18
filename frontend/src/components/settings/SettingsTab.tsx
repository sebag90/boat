import { useEffect, useState } from 'react'
import { Save, Settings as SettingsIcon, ShieldAlert, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useDeleteBoat, useUpdateBoat } from '../../api/boats'
import { formatDateTime } from '../../lib/format'
import type { Boat } from '../../lib/types'
import {
  Badge,
  Button,
  Field,
  InlineError,
  Panel,
  PanelBody,
  PanelHeader,
  Spinner,
  TextArea,
  TextInput,
} from '../ui'
import { TabHeading } from '../entries/TabScaffold'

interface SettingsTabProps {
  boat: Boat
  onDeleted: () => void
}

export function SettingsTab({ boat, onDeleted }: SettingsTabProps) {
  const { t } = useI18n()
  const update = useUpdateBoat()
  const remove = useDeleteBoat()
  const [name, setName] = useState(boat.name)
  const [description, setDescription] = useState(boat.description)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setName(boat.name)
    setDescription(boat.description)
  }, [boat])

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setError(null)
    setSaved(false)
    try {
      await update.mutateAsync({ id: boat.id, name: name.trim(), description })
      setSaved(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  async function onDelete() {
    if (!window.confirm(t('confirm.deleteBoat'))) return
    setError(null)
    try {
      await remove.mutateAsync(boat.id)
      onDeleted()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('app.error'))
    }
  }

  return (
    <>
      <TabHeading
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        icon={<SettingsIcon className="size-5" />}
        aside={
          <Badge tone="neutral">{`${t('settings.registered')} ${formatDateTime(boat.created_at)}`}</Badge>
        }
      />

      <Panel className="mb-5">
        <PanelHeader title={t('settings.identity')} icon={<SettingsIcon className="size-4" />} />
        <PanelBody>
          <form onSubmit={onSave} className="space-y-4">
            <Field label={`${t('fleet.name')} · ${t('label.required')}`}>
              <TextInput value={name} required onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field label={t('fleet.description')}>
              <TextArea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>

            <InlineError message={error} />

            <div className="flex items-center justify-end gap-3">
              {saved && !update.isPending && (
                <span className="text-sm font-semibold text-foam-600">✓</span>
              )}
              <Button
                type="submit"
                disabled={update.isPending || !name.trim()}
                icon={update.isPending ? <Spinner /> : <Save className="size-4" />}
              >
                {update.isPending ? t('app.saving') : t('action.save')}
              </Button>
            </div>
          </form>
        </PanelBody>
      </Panel>

      <Panel className="border border-red-200/70 bg-red-50/40 ring-red-200/70">
        <PanelHeader
          title={t('settings.danger')}
          icon={<ShieldAlert className="size-4 text-signal-600" />}
        />
        <PanelBody className="space-y-4">
          <p className="text-sm text-navy-600">{t('settings.dangerBody')}</p>
          <Button
            variant="danger"
            onClick={onDelete}
            disabled={remove.isPending}
            icon={remove.isPending ? <Spinner /> : <Trash2 className="size-4" />}
          >
            {t('settings.decommission')}
          </Button>
        </PanelBody>
      </Panel>
    </>
  )
}
