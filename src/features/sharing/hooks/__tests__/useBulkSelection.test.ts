import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBulkSelection } from '../useBulkSelection'

describe('useBulkSelection', () => {
  it('starts not selecting with an empty selection', () => {
    const { result } = renderHook(() => useBulkSelection())
    expect(result.current.isSelecting).toBe(false)
    expect(result.current.selectedIds.size).toBe(0)
  })

  it('toggleSelecting turns selection mode on and off, clearing selection each time', () => {
    const { result } = renderHook(() => useBulkSelection())

    act(() => result.current.toggleSelecting())
    expect(result.current.isSelecting).toBe(true)

    act(() => result.current.toggleId('a'))
    expect(result.current.selectedIds.has('a')).toBe(true)

    act(() => result.current.toggleSelecting())
    expect(result.current.isSelecting).toBe(false)
    expect(result.current.selectedIds.size).toBe(0)
  })

  it('toggleId adds and removes ids from the selection', () => {
    const { result } = renderHook(() => useBulkSelection())

    act(() => result.current.toggleId('a'))
    act(() => result.current.toggleId('b'))
    expect(Array.from(result.current.selectedIds).sort()).toEqual(['a', 'b'])

    act(() => result.current.toggleId('a'))
    expect(Array.from(result.current.selectedIds)).toEqual(['b'])
  })

  it('exitSelection turns selection mode off and clears the selection', () => {
    const { result } = renderHook(() => useBulkSelection())

    act(() => result.current.toggleSelecting())
    act(() => result.current.toggleId('a'))
    act(() => result.current.toggleId('b'))

    act(() => result.current.exitSelection())
    expect(result.current.isSelecting).toBe(false)
    expect(result.current.selectedIds.size).toBe(0)
  })
})
