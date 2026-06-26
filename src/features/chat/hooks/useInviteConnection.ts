import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ChatConnection } from '../types'

export function useInviteConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post<ChatConnection>('/app/chat/connections/', { email })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-connections'] })
    },
  })
}
