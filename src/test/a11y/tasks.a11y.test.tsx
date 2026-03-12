import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import TasksPage from '@/features/tasks/TasksPage'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useDeleteTask } from '@/features/tasks/hooks/useDeleteTask'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'

vi.mock('@/features/tasks/hooks/useTasks')
vi.mock('@/features/tasks/hooks/useDeleteTask')
vi.mock('@/hooks/useFeatureGate')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')

const mockMutation = {
  mutate: vi.fn(),
  isPending: false,
} as unknown as ReturnType<typeof useDeleteTask>

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <TasksPage /> }], { initialEntries: ['/'] })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('TasksPage a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTasks).mockReturnValue({
      data: { tasks: [], total: 0 },
      isLoading: false,
    } as ReturnType<typeof useTasks>)
    vi.mocked(useDeleteTask).mockReturnValue(mockMutation)
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })
    vi.mocked(useDashboardSummary).mockReturnValue({ data: undefined, isLoading: false })
  })

  it('renders without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
