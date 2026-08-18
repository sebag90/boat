import { validWaypoints } from './nautical'
import type { Waypoint } from './types'

/**
 * Builds a geojson.io deep link for the track (spec §3.3.6).
 * Falls back to the bare site when there is nothing to draw.
 */
export function geojsonIoUrl(waypoints: Waypoint[] | undefined): string {
  const points = validWaypoints(waypoints)
  if (points.length === 0) return 'https://geojson.io/'

  const features: unknown[] = []

  if (points.length >= 2) {
    features.push({
      type: 'Feature',
      properties: { name: 'Track', stroke: '#0284c7', 'stroke-width': 3 },
      geometry: {
        type: 'LineString',
        coordinates: points.map((wp) => [Number(wp.longitude), Number(wp.latitude)]),
      },
    })
  }

  points.forEach((wp, index) => {
    const isStart = index === 0
    const isEnd = index === points.length - 1 && points.length > 1
    features.push({
      type: 'Feature',
      properties: {
        title: `Waypoint ${index + 1}${wp.name ? `: ${wp.name}` : ''}`,
        timestamp: wp.timestamp,
        'marker-color': isStart ? '#0d9488' : isEnd ? '#dc2626' : '#0284c7',
        'marker-symbol': isStart ? 'play' : isEnd ? 'stop' : 'circle',
      },
      geometry: { type: 'Point', coordinates: [Number(wp.longitude), Number(wp.latitude)] },
    })
  })

  const collection = JSON.stringify({ type: 'FeatureCollection', features })
  const encoded = btoa(unescape(encodeURIComponent(collection)))
  return `https://geojson.io/#data=data:application/json;base64,${encoded}`
}
