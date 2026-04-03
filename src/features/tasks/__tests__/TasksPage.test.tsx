import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TasksPage from '../TasksPage'
import { useTasks } from '../hooks/useTasks'
import { useDeleteTask } from '../hooks/useDeleteTask'
import { useCreateTask } from '../hooks/useCreateTask'
import { useUpdateTask } from '../hooks/useUpdateTask'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import type { Task } from '../types'

vi.mock('../hooks/useTasks')
vi.mock('../hooks/useDeleteTask')
vi.mock('../hooks/useCreateTask')
vi.mock('../hooks/useUpdateTask')
vi.mock('@/hooks/useFeatureGate')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')

const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Fix login bug',
    description: 'Description here',
    status: 'in_progress',
    priority: 'high',
    due_date: '2026-03-20',
    comment_count: 2,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 't2',
    title: 'Write documentation',
    description: null,
    status: 'todo',
    priority: 'low',
    due_date: null,
    comment_count: 0,
    created_at: '2026-03-02T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
  },
]

const mockDeleteMutate = vi.fn()
const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

function renderTasksPage(path = '/tasks') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/tasks', element: <TasksPage /> }], {
    initialEntries: [path],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useTasks).mockReturnValue({
      data: { tasks: mockTasks, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useTasks>)

    vi.mocked(useDeleteTask).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteTask>)

    vi.mocked(useCreateTask).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateTask>)

    vi.mocked(useUpdateTask).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateTask>)

    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })

    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        active_tasks: 2,
        total_projects: 1,
        total_notes: 5,
        events_today: 0,
        usage: {
          tasks_active: 2,
          tasks_limit: 50,
          projects: 1,
          projects_limit: 10,
          notes: 5,
          notes_limit: 100,
        },
      },
      isLoading: false,
    })
  })

  it('renderiza el título de la página', () => {
    renderTasksPage()
    expect(screen.getByText('Tareas')).toBeInTheDocument()
  })

  it('muestra el botón Nueva Tarea', () => {
    renderTasksPage()
    expect(screen.getByText('Nueva Tarea')).toBeInTheDocument()
  })

  it('muestra lista de tareas', () => {
    renderTasksPage()
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
    expect(screen.getByText('Write documentation')).toBeInTheDocument()
  })

  it('muestra el contador de tareas', () => {
    renderTasksPage()
    expect(screen.getByText('2 tareas')).toBeInTheDocument()
  })

  it('muestra skeleton cuando isLoading=true', () => {
    vi.mocked(useTasks).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useTasks>)

    const { container } = renderTasksPage()
    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)
  })

  it('muestra estado vacío cuando no hay tareas', () => {
    vi.mocked(useTasks).mockReturnValue({
      data: { tasks: [], total: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof useTasks>)

    renderTasksPage()
    expect(screen.getByText('No hay tareas')).toBeInTheDocument()
  })

  it('abre modal al hacer click en Nueva Tarea', () => {
    renderTasksPage()
    fireEvent.click(screen.getByText('Nueva Tarea'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nueva tarea')).toBeInTheDocument()
  })

  it('abre modal de edición al hacer click en editar', () => {
    renderTasksPage()
    const editButtons = screen.getAllByLabelText('Editar tarea')
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar tarea')).toBeInTheDocument()
  })

  it('cierra modal al hacer click en Cancelar', () => {
    renderTasksPage()
    fireEvent.click(screen.getByText('Nueva Tarea'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cierra modal al hacer click en Cerrar modal', () => {
    renderTasksPage()
    fireEvent.click(screen.getByText('Nueva Tarea'))
    fireEvent.click(screen.getByLabelText('Cerrar modal'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('muestra las cabeceras de la tabla', () => {
    renderTasksPage()
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Prioridad')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Fecha límite')).toBeInTheDocument()
  })

  it('activa eliminación con doble click en botón eliminar', () => {
    renderTasksPage()
    const deleteButtons = screen.getAllByLabelText('Eliminar tarea')
    fireEvent.click(deleteButtons[0])
    expect(screen.getByLabelText('Confirmar eliminación')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Confirmar eliminación'))
    expect(mockDeleteMutate).toHaveBeenCalledWith('t1')
  })

  it('muestra badges de prioridad', () => {
    renderTasksPage()
    expect(screen.getAllByText('Alta').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Baja').length).toBeGreaterThan(0)
  })

  it('muestra badges de estado', () => {
    renderTasksPage()
    expect(screen.getAllByText('En progreso').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Por hacer').length).toBeGreaterThan(0)
  })

  it('muestra banner de plan cuando se alcanza el 80%', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        active_tasks: 41,
        total_projects: 1,
        total_notes: 5,
        events_today: 0,
        usage: {
          tasks_active: 41,
          tasks_limit: 50,
          projects: 1,
          projects_limit: 10,
          notes: 5,
          notes_limit: 100,
        },
      },
      isLoading: false,
    })

    renderTasksPage()
    expect(screen.getByText(/límite de tareas/)).toBeInTheDocument()
  })

  it('oculta banner de plan cuando tasksLimit es null', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        active_tasks: 100,
        total_projects: 1,
        total_notes: 5,
        events_today: 0,
        usage: {
          tasks_active: 100,
          tasks_limit: null,
          projects: 1,
          projects_limit: null,
          notes: 5,
          notes_limit: null,
        },
      },
      isLoading: false,
    })

    renderTasksPage()
    expect(screen.queryByText(/límite de tareas/)).not.toBeInTheDocument()
  })

  it('muestra botones de vista lista y kanban', () => {
    renderTasksPage()
    expect(screen.getByLabelText('Vista lista')).toBeInTheDocument()
    expect(screen.getByLabelText('Vista kanban')).toBeInTheDocument()
  })

  it('cambia a vista kanban cuando hasFeature=true', () => {
    renderTasksPage()
    fireEvent.click(screen.getByLabelText('Vista kanban'))
    // Kanban view shows 4 column headers
    expect(screen.getAllByText('Por hacer').length).toBeGreaterThan(0)
    expect(screen.getAllByText('En progreso').length).toBeGreaterThan(0)
    expect(screen.getAllByText('En revisión').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Hecho').length).toBeGreaterThan(0)
  })

  it('deshabilita botón kanban cuando hasFeature=false', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => false,
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })

    renderTasksPage()
    const kanbanBtn = screen.getByLabelText('Vista kanban')
    expect(kanbanBtn).toBeDisabled()
  })

  it('abre modal cuando URL tiene ?new=true', () => {
    renderTasksPage('/tasks?new=true')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
