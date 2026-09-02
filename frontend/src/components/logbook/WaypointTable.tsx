import { Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { formatCoordinate, formatDateTime } from '../../lib/format'
import type { VoyageStats } from '../../lib/nautical'
import type { Waypoint } from '../../lib/types'
import { IconButton } from '../ui'

interface WaypointTableProps {
  waypoints: Waypoint[]
  stats: VoyageStats
  onDelete: (waypoint: Waypoint) => void
  deleting?: boolean
}

/** Waypoint list with per-row leg distance/speed and delete action (spec §3.3.7). */
export function WaypointTable({ waypoints, stats, onDelete, deleting }: WaypointTableProps) {
  const { t } = useI18n()
  if (waypoints.length === 0) {
    return <p className="text-sm font-medium text-on-surface-variant italic">{t('voyage.noWaypoints')}</p>
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 shadow-xs">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-surface-container label-caps text-on-surface-variant border-b border-outline-variant/30">
            <Th className="w-10">{t('voyage.table.index')}</Th>
            <Th>{t('voyage.table.time')}</Th>
            <Th>{t('voyage.table.position')}</Th>
            <Th className="text-right">{t('voyage.table.leg')}</Th>
            <Th className="text-right">{t('voyage.table.speed')}</Th>
            <Th className="w-12" />
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
          {waypoints.map((waypoint, index) => {
            const leg = stats.legs[index]
            return (
              <tr key={waypoint.id} className="h-12 hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-2 font-mono text-xs text-on-surface-variant">{index + 1}</td>
                <td className="px-4 py-2 font-mono text-xs whitespace-nowrap text-on-surface font-medium">
                  {formatDateTime(waypoint.timestamp)}
                  {waypoint.name && (
                    <span className="block text-xs text-on-surface-variant font-normal">{waypoint.name}</span>
                  )}
                </td>
                <td className="px-4 py-2 font-mono text-xs whitespace-nowrap text-on-surface-variant">
                  {formatCoordinate(Number(waypoint.latitude))},{' '}
                  {formatCoordinate(Number(waypoint.longitude))}
                </td>
                <td className="px-4 py-2 text-right whitespace-nowrap text-on-surface">
                  {leg ? (
                    <>
                      <span className="font-semibold">{leg.distanceNm.toFixed(2)} NM</span>
                      <span className="block text-xs text-on-surface-variant">
                        {leg.distanceKm.toFixed(2)} km
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {t('voyage.table.startLeg')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right whitespace-nowrap text-on-surface">
                  {leg ? (
                    <>
                      <span className="font-semibold">{leg.speedKnots.toFixed(1)} kn</span>
                      <span className="block text-xs text-on-surface-variant">
                        {leg.speedKmh.toFixed(1)} km/h
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-on-surface-variant">—</span>
                  )}
                </td>
                <td className="px-2 py-2 text-right">
                  <IconButton
                    tone="danger"
                    label={t('voyage.deleteWaypoint')}
                    icon={<Trash2 className="size-4" />}
                    disabled={deleting}
                    onClick={() => onDelete(waypoint)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-semibold ${className ?? ''}`}>{children}</th>
}
