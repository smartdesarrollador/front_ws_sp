import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ChatUser } from '../types'

interface ChatUsersResponse {
  users: ChatUser[]
}

export function useChatUsers(enabled = true) {
  return useQuery({
    queryKey: ['chat-users'],
    queryFn: async () => {
      const { data } = await apiClient.get<ChatUsersResponse>('/app/chat/users/')
      return data.users
    },
    enabled,
    staleTime: 60_000,
  })
}
