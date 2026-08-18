import { Gauge, Route, Timer, MapPin } from 'lucide-react'
import { useI18n } from '../../i18n'
import { formatDuration, type VoyageStats } from '../../lib/nautical'
import { StatTile } from '../ui'

/** Shown whenever a voyage has at least two waypoints (spec §3.3.8). */
export function VoyageSummary({ stats }: { stats: VoyageStats }) {
  const { t } = useI18n()
  if (stats.waypointCount < 2) return null

  return (
    <section className="rounded-2xl bg-linear-to-br from-navy-950 to-navy-800 p-4 shadow-chart">
      <h3 className="mb-3 flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-brass-300 uppercase">
        <Route className="size-3.5" />
        {t('voyage.summary')}
      </h3>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile
          label={t('voyage.totalDistance')}
          value={`${stats.totalNm.toFixed(2)} NM`}
          sub={`${stats.totalKm.toFixed(2)} km`}
          icon={<Route className="size-3" />}
        />
        <StatTile
          label={t('voyage.avgSpeed')}
          value={`${stats.avgKnots.toFixed(1)} kn`}
          sub={`${stats.avgKmh.toFixed(1)} km/h`}
          icon={<Gauge className="size-3" />}
        />
        <StatTile
          label={t('voyage.duration')}
          value={formatDuration(stats.durationMinutes)}
          icon={<Timer className="size-3" />}
        />
        <StatTile
          label={t('voyage.waypoints')}
          value={stats.waypointCount}
          icon={<MapPin className="size-3" />}
        />
      </div>
    </section>
  )
}
