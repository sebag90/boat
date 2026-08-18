import { useI18n } from '../../i18n'
import { Dropzone } from '../dropzone/Dropzone'
import { Field, Switch, TextArea, TextInput } from '../ui'
import type { EntryDraft } from './useEntryMutations'
import type { EntryType } from '../../lib/types'

interface EntryEditFormProps {
  type: EntryType
  draft: EntryDraft
  onChange: (patch: Partial<EntryDraft>) => void
}

/** Type-specific edit fields + single-file replacement dropzone (spec §4.2.3). */
export function EntryEditForm({ type, draft, onChange }: EntryEditFormProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      {type === 'document' && (
        <>
          <Field label={`${t('label.title')} · ${t('label.required')}`}>
            <TextInput value={draft.title} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <DescriptionField draft={draft} onChange={onChange} />
        </>
      )}

      {type === 'maintenance' && (
        <>
          <Field label={t('label.title')}>
            <TextInput value={draft.title} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label={`${t('label.date')} · ${t('label.required')}`}>
            <TextInput
              type="date"
              value={draft.date}
              onChange={(e) => onChange({ date: e.target.value })}
            />
          </Field>
          <DescriptionField draft={draft} onChange={onChange} />
        </>
      )}

      {type === 'todo' && (
        <>
          <Field label={t('todos.text')} hint={t('label.markdownHint')}>
            <TextArea value={draft.text} rows={5} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Switch
            checked={draft.done}
            onChange={(done) => onChange({ done })}
            label={t('status.done')}
          />
        </>
      )}

      {type === 'shopping' && (
        <>
          <Field label={`${t('shopping.name')} · ${t('label.required')}`}>
            <TextInput value={draft.name} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>
          <DescriptionField draft={draft} onChange={onChange} />
          <Field label={t('shopping.link')}>
            <TextInput
              type="url"
              inputMode="url"
              placeholder="https://"
              value={draft.link}
              onChange={(e) => onChange({ link: e.target.value })}
            />
          </Field>
          <Switch
            checked={draft.done}
            onChange={(done) => onChange({ done })}
            label={t('status.purchased')}
          />
        </>
      )}

      <Field label={t('label.attachment')}>
        <Dropzone
          multiple={false}
          files={draft.file ? [draft.file] : []}
          onChange={(files) => onChange({ file: files[0] ?? null })}
          accept={type === 'document' ? 'image/*,.pdf,.doc,.docx,.txt' : 'image/*,.pdf,.doc,.docx'}
        />
      </Field>
    </div>
  )
}

function DescriptionField({
  draft,
  onChange,
}: {
  draft: EntryDraft
  onChange: (patch: Partial<EntryDraft>) => void
}) {
  const { t } = useI18n()
  return (
    <Field label={t('label.description')} hint={t('label.markdownHint')}>
      <TextArea
        value={draft.description}
        rows={6}
        onChange={(e) => onChange({ description: e.target.value })}
      />
    </Field>
  )
}
