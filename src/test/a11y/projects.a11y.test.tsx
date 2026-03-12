import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import ProjectsPage from '@/features/projects/ProjectsPage'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useDeleteProject } from '@/features/projects/hooks/useDeleteProject'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useFeatureGate } from '@/hooks/useFeatureGate'

vi.mock('@/features/projects/hooks/useProjects')
vi.mock('@/features/projects/hooks/useDeleteProject')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')
vi.mock('@/hooks/useFeatureGate')
vi.mock('@/components/shared/FeatureGate', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

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
  const router = createMemoryRouter([{ path: '/', element: <ProjectsPage /> }], { initialEntries: ['/'] })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('ProjectsPage a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useProjects).mockReturnValue({
      data: { projects: [], total: 0 },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useProjects>)
    vi.mocked(useDeleteProject).mockReturnValue(mockMutation as unknown as ReturnType<typeof useDeleteProject>)
    vi.mocked(useDashboardSummary).mockReturnValue({ data: undefined, isLoading: false })
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })
  })

  it('renders without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
