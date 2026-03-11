import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { UpdateEventRequest, CalendarEvent } from '../types'

interface UpdateEventInput extends UpdateEventRequest {
  id: string
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateEventInput) => {
      const response = await apiClient.patch<CalendarEvent>(`/app/calendar/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}
