export type CalendarView = 'month' | 'week' | 'day'
export type EventCategory = 'meeting' | 'standup' | 'client' | 'review' | 'personal'

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  meeting: '#3b82f6',
  standup: '#8b5cf6',
  client: '#10b981',
  review: '#f59e0b',
  personal: '#ec4899',
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  meeting: 'Reunión',
  standup: 'Standup',
  client: 'Cliente',
  review: 'Revisión',
  personal: 'Personal',
}

// El backend solo persiste `color`; la categoría es un concepto del frontend.
// Mapa inverso para reconstruir la categoría al editar un evento existente.
export const COLOR_TO_CATEGORY: Record<string, EventCategory> = Object.fromEntries(
  Object.entries(CATEGORY_COLORS).map(([cat, color]) => [color, cat]),
) as Record<string, EventCategory>

// Forma interna del frontend (usa `all_day` y `category`).
export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  all_day: boolean
  category: EventCategory
  color: string
  location: string | null
  created_at: string
  updated_at: string
}

// Forma cruda que devuelve el backend (usa `is_all_day`, sin `category`).
export interface CalendarEventApi {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  is_all_day: boolean
  color: string
  location: string | null
  created_at: string
  updated_at: string
}

// Contrato de escritura del backend (CalendarEventCreateUpdateSerializer).
export interface CreateEventRequest {
  title: string
  description?: string
  start_datetime: string
  end_datetime: string
  is_all_day?: boolean
  color?: string
  location?: string
}

export type UpdateEventRequest = Partial<CreateEventRequest>
