import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CalendarEvent } from '../types'

interface CalendarEventsResponse {
  results: CalendarEvent[]
  count: number
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
    select: (data) => ({ events: data.results, total: data.count }),
  })
}
