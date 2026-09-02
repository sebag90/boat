import { Anchor, MoveRight, Navigation } from 'lucide-react'
import { useI18n } from '../../i18n'

/** Departure ⇒ destination banner. */
export function RouteBanner({ start, goal }: { start: string; goal: string }) {
  const { t } = useI18n()
  if (!start && !goal) return null

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 px-5 py-4 shadow-xs">
      <Endpoint
        icon={<Anchor className="size-4 text-secondary" />}
        label={t('logbook.start')}
        value={start || '—'}
      />
      <MoveRight className="size-5 shrink-0 text-secondary" />
      <Endpoint
        icon={<Navigation className="size-4 text-secondary" />}
        label={t('logbook.goal')}
        value={goal || '—'}
      />
    </section>
  )
}

function Endpoint({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-1.5 label-caps text-on-surface-variant font-semibold">
        {icon}
        {label}
      </p>
      <p className="truncate font-display text-lg font-bold text-primary mt-0.5">{value}</p>
    </div>
  )
}
