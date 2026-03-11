import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateEventRequest, CalendarEvent } from '../types'

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateEventRequest) => {
      const response = await apiClient.post<CalendarEvent>('/app/calendar/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
