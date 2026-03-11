import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReportsPage from '../ReportsPage'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useSummary } from '../hooks/useSummary'
import { useUsageReport } from '../hooks/useUsageReport'
import { useTrends } from '../hooks/useTrends'

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('@/hooks/useFeatureGate')
vi.mock('../hooks/useSummary')
vi.mock('../hooks/useUsageReport')
vi.mock('../hooks/useTrends')

const mockSummary = {
  active_tasks: 15,
  completed_tasks: 47,
  total_projects: 8,
  storage_used_gb: 2.5,
}

const mockUsage = {
  tasks_by_status: [],
  tasks_by_priority: [],
}

const mockFeatureGateAll = {
  hasFeature: () => true,
  getLimit: () => null,
  plan: 'professional',
  isLoading: false,
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <ReportsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTrends).mockReturnValue({ trends: { period: '7d', data: [] }, isLoading: false })
  })

  it('renders heading "Reportes"', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    expect(screen.getByText('Reportes')).toBeInTheDocument()
  })

  it('shows KPI values (active_tasks=15, completed_tasks=47, total_projects=8)', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('47')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('shows upgrade prompt when hasFeature("analytics") = false', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      ...mockFeatureGateAll,
      hasFeature: (f: string) => f !== 'analytics',
    })
    vi.mocked(useSummary).mockReturnValue({ summary: undefined, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: undefined, isLoading: false })

    renderPage()

    expect(screen.getByText(/actualizar plan/i)).toBeInTheDocument()
  })

  it('shows skeleton cards when isLoading', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: undefined, isLoading: true })
    vi.mocked(useUsageReport).mockReturnValue({ usage: undefined, isLoading: true })

    const { container } = renderPage()

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows "analytics_trends" gate when trends not in plan', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      ...mockFeatureGateAll,
      hasFeature: (f: string) => f !== 'analytics_trends',
    })
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    expect(screen.getByText(/actualizar plan/i)).toBeInTheDocument()
  })

  it('shows disabled export when hasFeature("analytics_export") = false', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      ...mockFeatureGateAll,
      hasFeature: (f: string) => f !== 'analytics_export',
    })
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    const exportBtn = screen.getByRole('button', { name: /exportar csv/i })
    expect(exportBtn).toBeDisabled()
  })
})
