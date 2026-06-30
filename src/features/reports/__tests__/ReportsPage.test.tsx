import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReportsPage from '../ReportsPage'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useSummary } from '../hooks/useSummary'
import { useUsageReport } from '../hooks/useUsageReport'
import { useDevOpsReport } from '../hooks/useDevOpsReport'
import { useActivityReport } from '../hooks/useActivityReport'
import { useTrends } from '../hooks/useTrends'
import type { DevOpsReport, ActivityReport } from '../types'

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('@/hooks/useFeatureGate')
vi.mock('../hooks/useSummary')
vi.mock('../hooks/useUsageReport')
vi.mock('../hooks/useDevOpsReport')
vi.mock('../hooks/useActivityReport')
vi.mock('../hooks/useTrends')

const mockSummary = {
  active_tasks: 15,
  completed_tasks: 45,
  overdue_tasks: 3,
  total_projects: 8,
  storage_used_gb: 2.5,
  usage: {
    tasks_active: 15,
    tasks_limit: 25,
    projects: 8,
    projects_limit: null,
    notes: 4,
    notes_limit: 100,
    contacts: 10,
    contacts_limit: 200,
    bookmarks: 2,
    bookmarks_limit: 100,
    snippets: 7,
    snippets_limit: 50,
  },
}

const mockActivity: ActivityReport = {
  period: '30d',
  requested_days: 30,
  retention_days: 365,
  total: 12,
  by_day: [{ date: '2026-06-29', count: 12 }],
  by_action: [{ action: 'tasks.import', count: 8 }],
}

const mockUsage = {
  tasks_by_status: [],
  tasks_by_priority: [{ priority: 'high', count: 4 }],
  overdue: [
    { id: 't1', title: 'Pagar factura', due_date: '2026-06-01', priority: 'urgent' },
  ],
}

const mockDevOps: DevOpsReport = {
  ssl: {
    valid: 2,
    expiring: 1,
    expired: 1,
    expiring_soon: [
      { id: 'c1', domain: 'expired.com', valid_until: '2026-06-01', days_until_expiry: -28 },
    ],
  },
  secrets: {
    env_vars: 6,
    ssh_keys: 1,
    vault_items: 2,
    stale: 2,
    stale_days: 90,
    oldest: [{ type: 'env_var', label: 'OLD_API_KEY', updated_at: '2026-01-01T00:00:00Z' }],
  },
  snippets_by_language: [{ language: 'python', count: 7 }],
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
    vi.mocked(useDevOpsReport).mockReturnValue({ devops: mockDevOps, isLoading: false })
    vi.mocked(useActivityReport).mockReturnValue({ activity: mockActivity, isLoading: false })
  })

  it('renders heading "Reportes"', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    expect(screen.getByText('Reportes')).toBeInTheDocument()
  })

  it('shows KPI values (active_tasks=15, completed_tasks=45, total_projects=8)', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('renders the overdue KPI, the completion rate and the overdue list', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    // Overdue KPI card (label + value)
    expect(screen.getByText('Tareas Vencidas')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    // New chart headings
    expect(screen.getByText('Distribución por Prioridad')).toBeInTheDocument()
    expect(screen.getByText('Tasa de finalización')).toBeInTheDocument()
    // Completion rate: 45 / (45 + 15) = 75%
    expect(screen.getByText('75%')).toBeInTheDocument()
    // Overdue list item
    expect(screen.getByText('Pagar factura')).toBeInTheDocument()
  })

  it('renders the DevOps section (SSL, secrets, snippets)', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    // Section + widget headings
    expect(screen.getByText('DevOps')).toBeInTheDocument()
    expect(screen.getByText('Certificados SSL')).toBeInTheDocument()
    expect(screen.getByText('Higiene de secretos')).toBeInTheDocument()
    expect(screen.getByText('Snippets por lenguaje')).toBeInTheDocument()
    // SSL expiring cert + secrets stale highlight
    expect(screen.getByText('expired.com')).toBeInTheDocument()
    expect(screen.getByText(/sin rotar hace más de 90 días/i)).toBeInTheDocument()
    expect(screen.getByText('OLD_API_KEY')).toBeInTheDocument()
  })

  it('renders the Activity section and the plan usage panel', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    const { container } = renderPage()

    // Activity section (gated audit_logs → rendered since mock grants all features)
    expect(screen.getByText('Actividad')).toBeInTheDocument()
    expect(screen.getByText('Actividad por día')).toBeInTheDocument()
    expect(screen.getByText('Por tipo de acción')).toBeInTheDocument()
    // Plan usage panel: heading + progress bars from summary.usage
    expect(screen.getByText('Uso vs plan')).toBeInTheDocument()
    expect(container.querySelectorAll('[role="progressbar"]').length).toBeGreaterThan(0)
    // Unlimited projects render the "ilimitado" hint
    expect(screen.getByText(/ilimitado/i)).toBeInTheDocument()
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
