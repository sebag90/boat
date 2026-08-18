import { parseTimestamp } from './format'
import type { Waypoint } from './types'

export const EARTH_RADIUS_NM = 3440.065
export const NM_TO_KM = 1.852
export const DEFAULT_CENTER: [number, number] = [43.7384, 7.4246] // Monaco

export interface Leg {
  /** Distance from the previous waypoint, nautical miles. */
  distanceNm: number
  distanceKm: number
  speedKnots: number
  speedKmh: number
}

export interface VoyageStats {
  waypointCount: number
  totalNm: number
  totalKm: number
  avgKnots: number
  avgKmh: number
  durationMinutes: number
  legs: (Leg | null)[]
}

/** Great-circle distance in nautical miles (Haversine, R = 3440.065 NM). */
export function haversineNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = Math.PI / 180
  const dLat = (lat2 - lat1) * toRad
  const dLon = (lon2 - lon1) * toRad
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.min(1, Math.sqrt(a)))
}

/** Drops waypoints with non-numeric coordinates. */
export function validWaypoints(waypoints: Waypoint[] | undefined): Waypoint[] {
  return (waypoints ?? []).filter(
    (wp) => Number.isFinite(Number(wp.latitude)) && Number.isFinite(Number(wp.longitude)),
  )
}

function hoursBetween(from?: string | null, to?: string | null): number {
  const a = parseTimestamp(from)
  const b = parseTimestamp(to)
  if (!a || !b) return 0
  return Math.abs(b.getTime() - a.getTime()) / 3_600_000
}

/** Leg metrics of `waypoint` relative to `previous`. */
export function legBetween(previous: Waypoint, waypoint: Waypoint): Leg {
  const distanceNm = haversineNm(
    Number(previous.latitude),
    Number(previous.longitude),
    Number(waypoint.latitude),
    Number(waypoint.longitude),
  )
  const hours = hoursBetween(previous.timestamp, waypoint.timestamp)
  const speedKnots = hours > 0 ? distanceNm / hours : 0
  return {
    distanceNm,
    distanceKm: distanceNm * NM_TO_KM,
    speedKnots,
    speedKmh: speedKnots * NM_TO_KM,
  }
}

export function voyageStats(waypoints: Waypoint[] | undefined): VoyageStats {
  const points = validWaypoints(waypoints)
  const legs: (Leg | null)[] = points.map((wp, index) =>
    index === 0 ? null : legBetween(points[index - 1], wp),
  )
  const totalNm = legs.reduce((sum, leg) => sum + (leg?.distanceNm ?? 0), 0)

  let avgKnots = 0
  let durationMinutes = 0
  if (points.length >= 2) {
    const first = parseTimestamp(points[0].timestamp)?.getTime() ?? 0
    const last = parseTimestamp(points[points.length - 1].timestamp)?.getTime() ?? 0
    const elapsedMs = last - first
    if (elapsedMs > 0) {
      avgKnots = totalNm / (elapsedMs / 3_600_000)
      durationMinutes = Math.floor(elapsedMs / 60_000)
    }
  }

  return {
    waypointCount: points.length,
    totalNm,
    totalKm: totalNm * NM_TO_KM,
    avgKnots,
    avgKmh: avgKnots * NM_TO_KM,
    durationMinutes,
    legs,
  }
}

/** `Xh Ym`, `Ym` under one hour, `0m` when non-positive. */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m'
  const total = Math.floor(minutes)
  const hours = Math.floor(total / 60)
  const mins = total % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

/** Total nautical miles across a fleet of voyages (<2 waypoints ⇒ 0). */
export function totalFleetDistance(voyages: { waypoints?: Waypoint[] }[]): number {
  return voyages.reduce((sum, voyage) => {
    const points = validWaypoints(voyage.waypoints)
    if (points.length < 2) return sum
    return sum + voyageStats(points).totalNm
  }, 0)
}
