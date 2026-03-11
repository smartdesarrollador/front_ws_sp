import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from '../DashboardPage'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import { useRecentActivity } from '../hooks/useRecentActivity'
import { useAuthStore } from '@/store/authStore'
import type { DashboardSummary, RecentTask, UpcomingEvent } from '../types'

vi.mock('../hooks/useDashboardSummary')
vi.mock('../hooks/useRecentActivity')
vi.mock('@/store/authStore')

const mockSummary: DashboardSummary = {
  active_tasks: 12,
  total_projects: 4,
  total_notes: 23,
  events_today: 2,
  usage: {
    tasks_active: 12,
    tasks_limit: 50,
    projects: 4,
    projects_limit: 10,
    notes: 23,
    notes_limit: 100,
  },
}

const mockSummaryNoLimits: DashboardSummary = {
  ...mockSummary,
  usage: {
    tasks_active: 12,
    tasks_limit: null,
    projects: 4,
    projects_limit: null,
    notes: 23,
    notes_limit: null,
  },
}

const mockTasks: RecentTask[] = [
  { id: '1', title: 'Fix login bug', status: 'in_progress', priority: 'alta', due_date: '2026-03-15T00:00:00Z', updated_at: '2026-03-10T10:00:00Z' },
  { id: '2', title: 'Update README', status: 'todo', priority: 'baja', due_date: null, updated_at: '2026-03-09T10:00:00Z' },
]

const mockEvents: UpcomingEvent[] = [
  { id: 'e1', title: 'Team standup', start_datetime: '2026-03-11T09:00:00Z', end_datetime: '2026-03-11T09:30:00Z', color: '#3b82f6', all_day: false },
  { id: 'e2', title: 'Sprint review', start_datetime: '2026-03-12T14:00:00Z', end_datetime: '2026-03-12T15:00:00Z', color: null, all_day: false },
]

function renderDashboard() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <DashboardPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((selector?: (s: any) => unknown) => {
        const state = { user: { first_name: 'Ana' } }
        return typeof selector === 'function' ? selector(state) : state
      }) as unknown as typeof useAuthStore,
    )
  })

  it('renderiza 4 KPI cards con datos', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({ data: mockSummary, isLoading: false })
    vi.mocked(useRecentActivity).mockReturnValue({ recentTasks: [], upcomingEvents: [], isLoading: false })

    renderDashboard()

    expect(screen.getByText('Tareas Activas')).toBeInTheDocument()
    expect(screen.getAllByText('Proyectos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Notas').length).toBeGreaterThan(0)
    expect(screen.getByText('Eventos Hoy')).toBeInTheDocument()
    expect(screen.getAllByText('12').length).toBeGreaterThan(0)
    expect(screen.getAllByText('4').length).toBeGreaterThan(0)
  })

  it('muestra skeleton cuando isLoading=true', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({ data: undefined, isLoading: true })
    vi.mocked(useRecentActivity).mockReturnValue({ recentTasks: [], upcomingEvents: [], isLoading: true })

    const { container } = renderDashboard()

    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)
    expect(screen.queryByText('Tareas Activas')).not.toBeInTheDocument()
  })

  it('PlanUsageBanner visible cuando hay limits no-null', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({ data: mockSummary, isLoading: false })
    vi.mocked(useRecentActivity).mockReturnValue({ recentTasks: [], upcomingEvents: [], isLoading: false })

    renderDashboard()

    expect(screen.getByText('Uso del plan')).toBeInTheDocument()
  })

  it('PlanUsageBanner oculto cuando limits son null', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({ data: mockSummaryNoLimits, isLoading: false })
    vi.mocked(useRecentActivity).mockReturnValue({ recentTasks: [], upcomingEvents: [], isLoading: false })

    renderDashboard()

    expect(screen.queryByText('Uso del plan')).not.toBeInTheDocument()
  })

  it('RecentTasksWidget lista las tareas', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({ data: mockSummary, isLoading: false })
    vi.mocked(useRecentActivity).mockReturnValue({ recentTasks: mockTasks, upcomingEvents: [], isLoading: false })

    renderDashboard()

    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
    expect(screen.getByText('Update README')).toBeInTheDocument()
  })

  it('UpcomingEventsWidget lista los eventos', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({ data: mockSummary, isLoading: false })
    vi.mocked(useRecentActivity).mockReturnValue({ recentTasks: [], upcomingEvents: mockEvents, isLoading: false })

    renderDashboard()

    expect(screen.getByText('Team standup')).toBeInTheDocument()
    expect(screen.getByText('Sprint review')).toBeInTheDocument()
  })

  it('QuickActionsWidget muestra 3 botones de acción', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({ data: mockSummary, isLoading: false })
    vi.mocked(useRecentActivity).mockReturnValue({ recentTasks: [], upcomingEvents: [], isLoading: false })

    renderDashboard()

    expect(screen.getByText('Nueva Tarea')).toBeInTheDocument()
    expect(screen.getByText('Nueva Nota')).toBeInTheDocument()
    expect(screen.getByText('Nuevo Proyecto')).toBeInTheDocument()
  })

  it('muestra saludo con nombre del usuario', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({ data: mockSummary, isLoading: false })
    vi.mocked(useRecentActivity).mockReturnValue({ recentTasks: [], upcomingEvents: [], isLoading: false })

    renderDashboard()

    expect(screen.getByText('Hola, Ana')).toBeInTheDocument()
  })
})
