import { Images, MapPin, Route, Users } from 'lucide-react'
import { useI18n } from '../../i18n'
import { formatDate } from '../../lib/format'
import { validWaypoints, voyageStats } from '../../lib/nautical'
import type { LogEntry } from '../../lib/types'
import { excerptOf } from '../entries/EntryCard'

/** Voyage preview card: route, date, crew and logged distance. */
export function VoyageCard({ entry, onClick }: { entry: LogEntry; onClick: () => void }) {
  const { t } = useI18n()
  const waypoints = validWaypoints(entry.waypoints)
  const stats = voyageStats(waypoints)
  const route = [entry.start, entry.goal].filter(Boolean).join(' → ') || t('logbook.untitledRoute')

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-stretch gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4.5 text-left shadow-xs transition-all duration-200 hover:border-secondary/40 hover:shadow-chart hover:translate-y-[-1px] cursor-pointer"
      >
        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary-fixed text-on-secondary-fixed px-2 py-2.5 shadow-xs">
          <span className="font-display text-xl font-bold leading-none">
            {formatDate(entry.date).slice(0, 2)}
          </span>
          <span className="mt-1 label-caps text-[10px] text-secondary font-bold">
            {formatDate(entry.date).slice(3)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-primary">{route}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-on-surface-variant font-medium">
            {entry.crew && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5 text-secondary" />
                {entry.crew}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-secondary" />
              {waypoints.length} {t('voyage.waypoints')}
            </span>
            {entry.photo_count > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Images className="size-3.5 text-secondary" />
                {entry.photo_count} {t('photos.title')}
              </span>
            )}
            {stats.totalNm > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed text-on-primary-fixed px-2.5 py-0.5 label-caps font-bold">
                <Route className="size-3.5" />
                {stats.totalNm.toFixed(1)} NM
              </span>
            )}
          </div>
          {entry.description && (
            <p className="mt-1.5 truncate text-sm text-on-surface-variant">{excerptOf(entry.description)}</p>
          )}
        </div>
      </button>
    </li>
  )
}
