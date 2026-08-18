import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS, clearStorage, readStorage, writeStorage } from '../lib/storage'
import type { Boat } from '../lib/types'

/**
 * Keeps the active vessel in sync with localStorage: the persisted vessel wins
 * if it still exists, otherwise the first of the fleet (spec §4.4).
 */
export function useSelectedBoat(boats: Boat[] | undefined) {
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const stored = readStorage(STORAGE_KEYS.selectedBoatId)
    return stored ? Number(stored) : null
  })

  useEffect(() => {
    if (!boats) return
    if (boats.length === 0) {
      setSelectedId(null)
      clearStorage(STORAGE_KEYS.selectedBoatId)
      return
    }
    const exists = boats.some((boat) => boat.id === selectedId)
    if (!exists) {
      const next = boats[0].id
      setSelectedId(next)
      writeStorage(STORAGE_KEYS.selectedBoatId, String(next))
    }
  }, [boats, selectedId])

  const select = useCallback((boat: Boat) => {
    setSelectedId(boat.id)
    writeStorage(STORAGE_KEYS.selectedBoatId, String(boat.id))
  }, [])

  const clear = useCallback(() => {
    setSelectedId(null)
    clearStorage(STORAGE_KEYS.selectedBoatId)
  }, [])

  const selectedBoat = boats?.find((boat) => boat.id === selectedId) ?? null

  return { selectedBoat, select, clear }
}
