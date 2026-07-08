import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface RemoveAttendeeArgs {
  eventId: string
  userId: string
}

export function useRemoveAttendee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ eventId, userId }: RemoveAttendeeArgs) => {
      await apiClient.delete(`/app/calendar/${eventId}/attendees/${userId}/`)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-attendees', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}
