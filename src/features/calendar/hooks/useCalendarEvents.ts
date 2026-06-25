import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CalendarEvent, CalendarEventApi } from '../types'
import { COLOR_TO_CATEGORY } from '../types'

interface CalendarEventsResponse {
  results: CalendarEventApi[]
  count: number
}

// El backend devuelve `is_all_day` y `color` (sin `category`); el frontend
// trabaja con `all_day` y `category`. Mapear en la frontera de lectura.
function mapEvent(e: CalendarEventApi): CalendarEvent {
  const { is_all_day, ...rest } = e
  return {
    ...rest,
    all_day: is_all_day,
    category: COLOR_TO_CATEGORY[e.color] ?? 'meeting',
  }
}

export function useCalendarEvents(month: string) {
  return useQuery({
    queryKey: ['calendar', month],
    queryFn: async () => {
      const { data } = await apiClient.get<CalendarEventsResponse>('/app/calendar/', {
        params: { month },
      })
      return data
    },
    staleTime: 60_000,
    select: (data) => ({ events: data.results.map(mapEvent), total: data.count }),
  })
}
