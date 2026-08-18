export interface Fix {
  latitude: number
  longitude: number
  accuracy: number | null
}

const OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 0,
}

export function currentPosition(): Promise<Fix> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this device.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? null,
        }),
      (error) => reject(new Error(error.message || 'Unable to acquire a GPS fix.')),
      OPTIONS,
    )
  })
}

interface WakeLockSentinelLike {
  release: () => Promise<void>
}

/** Best-effort screen wake lock; failures are ignored by design. */
export async function requestWakeLock(): Promise<WakeLockSentinelLike | null> {
  try {
    const wakeLock = (navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<WakeLockSentinelLike> } })
      .wakeLock
    if (!wakeLock) return null
    return await wakeLock.request('screen')
  } catch {
    return null
  }
}

export async function releaseWakeLock(lock: WakeLockSentinelLike | null): Promise<void> {
  try {
    await lock?.release()
  } catch {
    /* ignore */
  }
}
