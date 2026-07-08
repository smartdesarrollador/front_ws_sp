import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface AddAttendeeArgs {
  eventId: string
  userId: string
}

export function useAddAttendee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ eventId, userId }: AddAttendeeArgs) => {
      const { data } = await apiClient.post(`/app/calendar/${eventId}/attendees/`, {
        user_id: userId,
      })
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-attendees', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}
