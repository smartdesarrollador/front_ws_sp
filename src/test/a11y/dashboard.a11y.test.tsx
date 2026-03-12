import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import DashboardPage from '@/features/dashboard/DashboardPage'
import { useAuthStore } from '@/store/authStore'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useRecentActivity } from '@/features/dashboard/hooks/useRecentActivity'

vi.mock('@/store/authStore')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')
vi.mock('@/features/dashboard/hooks/useRecentActivity')

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <DashboardPage /> }], { initialEntries: ['/'] })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('DashboardPage a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      const state = { user: { first_name: 'Test' } }
      return typeof selector === 'function' ? selector(state) : state
    })
    vi.mocked(useDashboardSummary).mockReturnValue({ data: undefined, isLoading: false })
    vi.mocked(useRecentActivity).mockReturnValue({ recentTasks: [], upcomingEvents: [], isLoading: false })
  })

  it('renders without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
