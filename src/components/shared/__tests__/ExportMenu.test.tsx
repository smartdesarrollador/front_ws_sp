import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ExportMenu, { type ExportFormat } from '../ExportMenu'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { usePermissions } from '@/hooks/usePermissions'

vi.mock('@/hooks/useFeatureGate')
vi.mock('@/hooks/usePermissions')

function mockFeature(enabled: boolean) {
  vi.mocked(useFeatureGate).mockReturnValue({
    hasFeature: () => enabled,
    getLimit: () => null,
    plan: enabled ? 'professional' : 'free',
    isLoading: false,
  })
}

function mockPermission(granted: boolean) {
  vi.mocked(usePermissions).mockReturnValue({
    hasPermission: () => granted,
    hasRole: () => granted,
    isOwner: granted,
    isAdmin: granted,
    getPrimaryRole: () => 'Owner',
    getRoleColor: () => '#000',
    tenant: null,
  } as unknown as ReturnType<typeof usePermissions>)
}

const oneFormat = (run = vi.fn()): ExportFormat[] => [{ id: 'csv', label: 'CSV', run }]
const twoFormats = (run = vi.fn()): ExportFormat[] => [
  { id: 'csv', label: 'CSV', run },
  { id: 'json', label: 'JSON', run },
]

describe('ExportMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPermission(true)
  })

  it('renders disabled fallback when feature is not available', () => {
    mockFeature(false)
    render(<ExportMenu feature="notes_export" formats={oneFormat()} disabledHint="upgrade" />)
    const btn = screen.getByRole('button', { name: /Exportar/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('title', 'upgrade')
  })

  it('runs the single format directly when feature is enabled', () => {
    mockFeature(true)
    const run = vi.fn()
    render(<ExportMenu feature="notes_export" formats={oneFormat(run)} />)
    fireEvent.click(screen.getByRole('button', { name: /Exportar/i }))
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('opens a dropdown and runs the chosen format with multiple formats', () => {
    mockFeature(true)
    const run = vi.fn()
    render(<ExportMenu feature="notes_export" formats={twoFormats(run)} />)
    fireEvent.click(screen.getByRole('button', { name: /Exportar/i }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'JSON' }))
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('returns null when the required permission is missing', () => {
    mockFeature(true)
    mockPermission(false)
    const { container } = render(
      <ExportMenu feature="notes_export" permission="notes.read" formats={oneFormat()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
