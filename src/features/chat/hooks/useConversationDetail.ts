import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ConversationDetail } from '../types'

export function useConversationDetail(conversationId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['chat-conversation', conversationId],
    queryFn: async () => {
      const { data } = await apiClient.get<ConversationDetail>(
        `/app/chat/conversations/${conversationId}/`,
      )
      return data
    },
    enabled: enabled && !!conversationId,
  })
}
