import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import CalendarPage from '@/features/calendar/CalendarPage'
import { useCalendarEvents } from '@/features/calendar/hooks/useCalendarEvents'
import { useDeleteEvent } from '@/features/calendar/hooks/useDeleteEvent'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'

vi.mock('@/features/calendar/hooks/useCalendarEvents')
vi.mock('@/features/calendar/hooks/useDeleteEvent')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')

const mockMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
  reset: vi.fn(),
  variables: undefined,
  status: 'idle' as const,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isIdle: true,
  isPaused: false,
  submittedAt: 0,
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <CalendarPage /> }], { initialEntries: ['/'] })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('CalendarPage a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCalendarEvents).mockReturnValue({
      data: { events: [], total: 0 },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCalendarEvents>)
    vi.mocked(useDeleteEvent).mockReturnValue(mockMutation as unknown as ReturnType<typeof useDeleteEvent>)
    vi.mocked(useDashboardSummary).mockReturnValue({ data: undefined, isLoading: false })
  })

  it('renders without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
