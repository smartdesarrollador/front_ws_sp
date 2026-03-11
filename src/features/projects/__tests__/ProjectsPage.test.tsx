import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProjectsPage from '../ProjectsPage'
import { useProjects } from '../hooks/useProjects'
import { useCreateProject } from '../hooks/useCreateProject'
import { useUpdateProject } from '../hooks/useUpdateProject'
import { useDeleteProject } from '../hooks/useDeleteProject'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import type { Project } from '../types'

vi.mock('../hooks/useProjects')
vi.mock('../hooks/useCreateProject')
vi.mock('../hooks/useUpdateProject')
vi.mock('../hooks/useDeleteProject')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')
vi.mock('@/hooks/useFeatureGate')
vi.mock('../components/ProjectDetail', () => ({
  default: () => <div data-testid="project-detail">Detail</div>,
}))

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Proyecto Alpha',
    description: 'Proyecto de prueba activo',
    status: 'active',
    color: '#2563eb',
    sections_count: 3,
    items_count: 12,
    members_count: 2,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'p2',
    name: 'Proyecto Beta',
    description: 'Proyecto archivado',
    status: 'archived',
    color: '#9333ea',
    sections_count: 1,
    items_count: 5,
    members_count: 1,
    created_at: '2026-01-02',
    updated_at: '2026-01-02',
  },
]

const mockDeleteMutate = vi.fn()
const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

const defaultSummaryData = {
  active_tasks: 2,
  total_projects: 2,
  total_notes: 5,
  events_today: 0,
  usage: {
    tasks_active: 2,
    tasks_limit: 50,
    projects: 2,
    projects_limit: 10,
    notes: 5,
    notes_limit: 100,
    contacts: 2,
    contacts_limit: 100,
    bookmarks: 5,
    bookmarks_limit: 50,
    snippets: 5,
    snippets_limit: 50,
  },
}

function renderProjectsPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/projects', element: <ProjectsPage /> }], {
    initialEntries: ['/projects'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useProjects).mockReturnValue({
      data: { projects: mockProjects, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useProjects>)

    vi.mocked(useDeleteProject).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteProject>)

    vi.mocked(useCreateProject).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateProject>)

    vi.mocked(useUpdateProject).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateProject>)

    vi.mocked(useDashboardSummary).mockReturnValue({
      data: defaultSummaryData,
      isLoading: false,
    })

    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })
  })

  it('renderiza el título "Proyectos"', () => {
    renderProjectsPage()
    expect(screen.getByText('Proyectos')).toBeInTheDocument()
  })

  it('muestra ambos proyectos en la lista', () => {
    renderProjectsPage()
    expect(screen.getByText('Proyecto Alpha')).toBeInTheDocument()
    expect(screen.getByText('Proyecto Beta')).toBeInTheDocument()
  })

  it('el botón "Nuevo Proyecto" abre el ProjectModal', () => {
    renderProjectsPage()
    fireEvent.click(screen.getByText('Nuevo Proyecto'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('click en Editar abre el modal con "Editar proyecto"', () => {
    renderProjectsPage()
    const editButtons = screen.getAllByLabelText('Editar proyecto')
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar proyecto')).toBeInTheDocument()
  })

  it('click en tarjeta de proyecto muestra el panel de detalle', () => {
    renderProjectsPage()
    const projectCard = screen.getByText('Proyecto Alpha').closest('[role="button"]')
    expect(projectCard).not.toBeNull()
    fireEvent.click(projectCard!)
    expect(screen.getByTestId('project-detail')).toBeInTheDocument()
  })

  it('muestra banner de plan cuando proyectos >= 80% del límite', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        ...defaultSummaryData,
        usage: {
          ...defaultSummaryData.usage,
          projects: 9,
          projects_limit: 10,
        },
      },
      isLoading: false,
    })

    renderProjectsPage()
    expect(screen.getByText(/límite de.*proyectos/i)).toBeInTheDocument()
  })

  it('muestra skeleton cuando isLoading=true', () => {
    vi.mocked(useProjects).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useProjects>)

    const { container } = renderProjectsPage()
    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)
  })

  it('muestra estado vacío cuando no hay proyectos', () => {
    vi.mocked(useProjects).mockReturnValue({
      data: { projects: [], total: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof useProjects>)

    renderProjectsPage()
    expect(screen.getByText('No hay proyectos')).toBeInTheDocument()
  })

  it('Export muestra fallback disabled cuando no tiene feature projects_export', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => false,
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })

    renderProjectsPage()
    const exportBtn = screen.getByRole('button', { name: /Exportar/i })
    expect(exportBtn).toBeDisabled()
  })

  it('ViewModeToggle cambia entre grid y lista', () => {
    renderProjectsPage()
    const listBtn = screen.getByLabelText('Vista de lista')
    fireEvent.click(listBtn)
    expect(listBtn).toHaveAttribute('aria-pressed', 'true')

    const gridBtn = screen.getByLabelText('Vista de cuadrícula')
    fireEvent.click(gridBtn)
    expect(gridBtn).toHaveAttribute('aria-pressed', 'true')
  })
})
