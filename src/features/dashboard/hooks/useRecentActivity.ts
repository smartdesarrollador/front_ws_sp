import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { RecentTask, UpcomingEvent } from '../types'

interface TasksResponse {
  results: RecentTask[]
}

interface CalendarResponse {
  results: UpcomingEvent[]
}

export function useRecentActivity() {
  const tasksQuery = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: () =>
      apiClient
        .get<TasksResponse>('/app/tasks/', { params: { ordering: '-updated_at', page_size: 5 } })
        .then((r) => r.data.results),
    staleTime: 60_000,
  })

  const eventsQuery = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () =>
      apiClient
        .get<CalendarResponse>('/app/calendar/', { params: { upcoming: true, page_size: 5 } })
        .then((r) => r.data.results),
    staleTime: 60_000,
  })

  return {
    recentTasks: tasksQuery.data ?? [],
    upcomingEvents: eventsQuery.data ?? [],
    isLoading: tasksQuery.isLoading || eventsQuery.isLoading,
  }
}
