import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Message } from '../types'

interface MessagesResponse {
  results: Message[]
  count: number
  has_more: boolean
}

export function useMessages(conversationId: string | null, realtime = false) {
  return useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      const { data } = await apiClient.get<MessagesResponse>('/app/chat/messages/', {
        params: { conversation: conversationId },
      })
      return data
    },
    enabled: !!conversationId,
    // Polling is the fallback: slow when the WebSocket is live, fast otherwise.
    refetchInterval: realtime ? 20_000 : 3_000,
  })
}
