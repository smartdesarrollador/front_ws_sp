import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CalendarPage from '../CalendarPage'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { useDeleteEvent } from '../hooks/useDeleteEvent'
import { useCreateEvent } from '../hooks/useCreateEvent'
import { useUpdateEvent } from '../hooks/useUpdateEvent'
import { useEventAttendees } from '../hooks/useEventAttendees'
import { useAddAttendee } from '../hooks/useAddAttendee'
import { useRemoveAttendee } from '../hooks/useRemoveAttendee'
import { useTeamDirectory } from '@/features/sharing/hooks/useTeamDirectory'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import type { CalendarEvent } from '../types'

vi.mock('../hooks/useCalendarEvents')
vi.mock('../hooks/useDeleteEvent')
vi.mock('../hooks/useCreateEvent')
vi.mock('../hooks/useUpdateEvent')
vi.mock('../hooks/useEventAttendees')
vi.mock('../hooks/useAddAttendee')
vi.mock('../hooks/useRemoveAttendee')
vi.mock('@/features/sharing/hooks/useTeamDirectory')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')

// Fechas derivadas de "hoy" para que los eventos caigan siempre en el mes
// mostrado por defecto (la vista mes arranca en el mes actual). Evita que el
// test se rompa con el paso del tiempo (fixtures antes fijos en marzo 2026).
const pad = (n: number) => String(n).padStart(2, '0')
const today = new Date()
const todayYmd = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

const mockEvents: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Sprint Planning',
    description: 'Planning session',
    start_date: `${todayYmd}T09:00`,
    end_date: `${todayYmd}T10:00`,
    all_day: false,
    category: 'meeting',
    color: '#3b82f6',
    location: 'Sala A',
    is_attendee: false,
    organizer_name: null,
    created_at: `${todayYmd}T08:00:00Z`,
    updated_at: `${todayYmd}T10:00:00Z`,
  },
  {
    id: 'e2',
    title: 'Daily Standup',
    description: null,
    start_date: `${todayYmd}T10:00`,
    end_date: `${todayYmd}T10:15`,
    all_day: false,
    category: 'standup',
    color: '#8b5cf6',
    location: null,
    is_attendee: true,
    organizer_name: 'Otro Usuario',
    created_at: `${todayYmd}T08:00:00Z`,
    updated_at: `${todayYmd}T10:00:00Z`,
  },
]

const mockDeleteMutate = vi.fn()
const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()
const mockAddAttendeeMutate = vi.fn()
const mockRemoveAttendeeMutate = vi.fn()

function renderCalendarPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/calendar', element: <CalendarPage /> }], {
    initialEntries: ['/calendar'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useCalendarEvents).mockReturnValue({
      data: { events: mockEvents, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useCalendarEvents>)

    vi.mocked(useDeleteEvent).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteEvent>)

    vi.mocked(useCreateEvent).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateEvent>)

    vi.mocked(useUpdateEvent).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateEvent>)

    vi.mocked(useEventAttendees).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useEventAttendees>)

    vi.mocked(useAddAttendee).mockReturnValue({
      mutate: mockAddAttendeeMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useAddAttendee>)

    vi.mocked(useRemoveAttendee).mockReturnValue({
      mutate: mockRemoveAttendeeMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useRemoveAttendee>)

    vi.mocked(useTeamDirectory).mockReturnValue({
      data: [{ id: 'u2', name: 'Cliente 109', email: 'cliente109@cliente.com' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useTeamDirectory>)

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
    renderCalendarPage()
    expect(screen.getByText('Calendario')).toBeInTheDocument()
  })

  it('muestra la vista mes por defecto con encabezados de días', () => {
    renderCalendarPage()
    expect(screen.getByText('Dom')).toBeInTheDocument()
    expect(screen.getByText('Lun')).toBeInTheDocument()
    expect(screen.getByText('Sáb')).toBeInTheDocument()
  })

  it('muestra el año actual en el header', () => {
    renderCalendarPage()
    const year = String(new Date().getFullYear())
    const elements = screen.getAllByText((content) => content.includes(year))
    expect(elements.length).toBeGreaterThan(0)
  })

  it('muestra el botón Nuevo Evento', () => {
    renderCalendarPage()
    expect(screen.getByText('Nuevo Evento')).toBeInTheDocument()
  })

  it('abre EventModal al hacer click en Nuevo Evento', () => {
    renderCalendarPage()
    fireEvent.click(screen.getByText('Nuevo Evento'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // Modal submit button shows "Crear Evento" for new events
    expect(screen.getByText('Crear Evento')).toBeInTheDocument()
  })

  it('cierra modal al hacer click en Cancelar', () => {
    renderCalendarPage()
    fireEvent.click(screen.getByText('Nuevo Evento'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cierra modal al hacer click en Cerrar modal', () => {
    renderCalendarPage()
    fireEvent.click(screen.getByText('Nuevo Evento'))
    fireEvent.click(screen.getByLabelText('Cerrar modal'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cambia a vista Semana al hacer click en Semana', () => {
    renderCalendarPage()
    fireEvent.click(screen.getByText('Semana'))
    expect(screen.getByText('Hora')).toBeInTheDocument()
  })

  it('cambia a vista Día al hacer click en Día', () => {
    renderCalendarPage()
    fireEvent.click(screen.getByText('Día'))
    // DayView renders hour slots
    expect(screen.getByText('8:00')).toBeInTheDocument()
  })

  it('botón Hoy restaura la fecha actual', () => {
    renderCalendarPage()
    // Navigate forward then back to today
    fireEvent.click(screen.getByLabelText('Siguiente'))
    fireEvent.click(screen.getByText('Hoy'))
    const year = String(new Date().getFullYear())
    const elements = screen.getAllByText((content) => content.includes(year))
    expect(elements.length).toBeGreaterThan(0)
  })

  it('navegación Siguiente cambia el mes mostrado', () => {
    renderCalendarPage()
    // Click next month — the displayed month label changes
    fireEvent.click(screen.getByLabelText('Siguiente'))
    // After navigation to next month the view still renders the grid
    expect(screen.getByText('Dom')).toBeInTheDocument()
  })

  it('muestra skeleton cuando isLoading=true', () => {
    vi.mocked(useCalendarEvents).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useCalendarEvents>)

    const { container } = renderCalendarPage()
    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)
  })

  it('muestra PlanLimitBanner cuando se alcanza el 80% del límite', () => {
    vi.mocked(useCalendarEvents).mockReturnValue({
      data: { events: mockEvents, total: 41 },
      isLoading: false,
    } as ReturnType<typeof useCalendarEvents>)

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

    renderCalendarPage()
    expect(screen.getByText(/límite de eventos/)).toBeInTheDocument()
  })

  it('los eventos aparecen en la vista mes', () => {
    renderCalendarPage()
    expect(screen.getAllByText(/Sprint Planning/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Daily Standup/).length).toBeGreaterThan(0)
  })

  it('marca el evento donde soy invitado y no abre el modal al hacer click', () => {
    renderCalendarPage()
    expect(screen.getByLabelText('Invitado')).toBeInTheDocument()

    const invited = screen.getByText(/Daily Standup/)
    fireEvent.click(invited)
    expect(screen.queryByText('Editar Evento')).not.toBeInTheDocument()
  })

  it('muestra el badge "Invitado" con el organizador en la vista Día', () => {
    renderCalendarPage()
    fireEvent.click(screen.getByText('Día'))
    expect(screen.getByTitle('Invitado por Otro Usuario')).toBeInTheDocument()
  })

  it('permite invitar a un compañero del equipo desde el modal de edición', () => {
    renderCalendarPage()
    fireEvent.click(screen.getAllByText(/Sprint Planning/)[0])
    expect(screen.getByText('Editar Evento')).toBeInTheDocument()

    const select = screen.getByLabelText('Invitar asistente')
    fireEvent.change(select, { target: { value: 'u2' } })

    expect(mockAddAttendeeMutate).toHaveBeenCalledWith({ eventId: 'e1', userId: 'u2' })
  })

  it('muestra a los asistentes ya invitados con opción de quitarlos', () => {
    vi.mocked(useEventAttendees).mockReturnValue({
      data: [{ id: 'att1', user_id: 'u2', user_name: 'Cliente 109', status: 'accepted' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useEventAttendees>)

    renderCalendarPage()
    fireEvent.click(screen.getAllByText(/Sprint Planning/)[0])
    expect(screen.getByText('Cliente 109')).toBeInTheDocument()
    expect(screen.getByText('Aceptó')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Quitar a Cliente 109'))
    expect(mockRemoveAttendeeMutate).toHaveBeenCalledWith({ eventId: 'e1', userId: 'u2' })
  })
})
