import { useState } from 'react'

export function useBulkSelection() {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelecting = () => {
    setIsSelecting((v) => !v)
    setSelectedIds(new Set())
  }

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const exitSelection = () => {
    setIsSelecting(false)
    setSelectedIds(new Set())
  }

  return { isSelecting, toggleSelecting, selectedIds, toggleId, exitSelection }
}
