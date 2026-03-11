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

export interface CreateEventRequest {
  title: string
  description?: string
  start_date: string
  end_date: string
  all_day?: boolean
  category: EventCategory
  color?: string
  location?: string
}

export type UpdateEventRequest = Partial<CreateEventRequest>
