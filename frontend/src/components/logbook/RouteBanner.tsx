import { Anchor, MoveRight, Navigation } from 'lucide-react'
import { useI18n } from '../../i18n'

/** Departure ⇒ destination banner. */
export function RouteBanner({ start, goal }: { start: string; goal: string }) {
  const { t } = useI18n()
  if (!start && !goal) return null

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-card bg-tint px-4 py-3.5">
      <Endpoint
        icon={<Anchor className="size-3.5" />}
        label={t('logbook.start')}
        value={start || '—'}
      />
      <MoveRight className="size-5 shrink-0 text-navy-800" />
      <Endpoint
        icon={<Navigation className="size-3.5" />}
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
      <p className="flex items-center gap-1.5 label-mono text-navy-600">
        {icon}
        {label}
      </p>
      <p className="truncate text-headline-md text-navy-950">{value}</p>
    </div>
  )
}
