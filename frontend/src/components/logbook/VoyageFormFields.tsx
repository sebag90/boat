import { useI18n } from '../../i18n'
import { Field, TextArea, TextInput } from '../ui'

export interface VoyageDraft {
  date: string
  crew: string
  start: string
  goal: string
  description: string
}

interface VoyageFormFieldsProps {
  draft: VoyageDraft
  onChange: (patch: Partial<VoyageDraft>) => void
}

/** Shared metadata fields for creating and editing a voyage. */
export function VoyageFormFields({ draft, onChange }: VoyageFormFieldsProps) {
  const { t } = useI18n()
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t('label.date')} · ${t('label.required')}`}>
          <TextInput
            type="date"
            required
            value={draft.date}
            onChange={(event) => onChange({ date: event.target.value })}
          />
        </Field>
        <Field label={t('logbook.crew')}>
          <TextInput
            value={draft.crew}
            placeholder={t('logbook.crewPlaceholder')}
            onChange={(event) => onChange({ crew: event.target.value })}
          />
        </Field>
        <Field label={t('logbook.start')}>
          <TextInput
            value={draft.start}
            placeholder={t('logbook.startPlaceholder')}
            onChange={(event) => onChange({ start: event.target.value })}
          />
        </Field>
        <Field label={t('logbook.goal')}>
          <TextInput
            value={draft.goal}
            placeholder={t('logbook.goalPlaceholder')}
            onChange={(event) => onChange({ goal: event.target.value })}
          />
        </Field>
      </div>

      <Field label={t('logbook.notes')} hint={t('label.markdownHint')}>
        <TextArea
          rows={5}
          value={draft.description}
          placeholder={t('logbook.notesPlaceholder')}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </Field>
    </div>
  )
}
