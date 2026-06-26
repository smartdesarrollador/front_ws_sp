import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Conversation } from '../types'

interface ConversationsResponse {
  results: Conversation[]
  count: number
}

export function useConversations(realtime = false) {
  return useQuery({
    queryKey: ['chat-conversations'],
    queryFn: async () => {
      const { data } = await apiClient.get<ConversationsResponse>('/app/chat/conversations/')
      return data
    },
    // Polling is the fallback: slow when the WebSocket is live, fast otherwise.
    refetchInterval: realtime ? 30_000 : 5_000,
    select: (data) => ({ conversations: data.results, total: data.count }),
  })
}
