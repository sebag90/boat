import { useCallback, useEffect, useRef, useState } from 'react'
import { currentPosition, releaseWakeLock, requestWakeLock, type Fix } from '../lib/geolocation'

export const TRACKER_INTERVALS = [60, 120, 300, 600] as const
export type TrackerInterval = (typeof TRACKER_INTERVALS)[number]

interface Options {
  onFix: (fix: Fix) => Promise<void> | void
}

/**
 * GPS auto-tracker (spec §3.3.3): screen wake lock, an immediate fix on start
 * and a 1-second countdown ticker that captures a fix whenever it elapses.
 */
export function useAutoTracker({ onFix }: Options) {
  const [interval, setInterval] = useState<TrackerInterval>(60)
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [lastFixAt, setLastFixAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const timerRef = useRef<number | null>(null)
  const wakeLockRef = useRef<Awaited<ReturnType<typeof requestWakeLock>>>(null)
  const onFixRef = useRef(onFix)
  onFixRef.current = onFix

  const capture = useCallback(async () => {
    try {
      const fix = await currentPosition()
      await onFixRef.current(fix)
      setLastFixAt(new Date())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'GPS error')
    }
  }, [])

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    void releaseWakeLock(wakeLockRef.current)
    wakeLockRef.current = null
    setRunning(false)
    setCountdown(0)
  }, [])

  const start = useCallback(async () => {
    if (timerRef.current !== null) return
    setRunning(true)
    setError(null)
    wakeLockRef.current = await requestWakeLock()
    await capture()
    setCountdown(interval)
    timerRef.current = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          void capture()
          return interval
        }
        return value - 1
      })
    }, 1000)
  }, [capture, interval])

  // Clear the timer and release the wake lock on unmount.
  useEffect(() => stop, [stop])

  return {
    interval,
    setInterval,
    running,
    countdown,
    lastFixAt,
    error,
    start,
    stop,
    captureOnce: capture,
  }
}
