import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export type AttendeeStatus = 'invited' | 'accepted' | 'declined' | 'maybe'

export interface EventAttendee {
  id: string
  user_id: string
  user_name: string | null
  status: AttendeeStatus
  created_at: string
}

export function useEventAttendees(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ attendees: EventAttendee[] }>(
        `/app/calendar/${eventId}/attendees/`,
      )
      return data.attendees
    },
    enabled: !!eventId,
  })
}
