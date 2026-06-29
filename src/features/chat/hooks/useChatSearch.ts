import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ChatSearchResponse } from '../types'

export const CHAT_SEARCH_MIN_LEN = 2

/** Searches message content across all conversations the user belongs to. */
export function useChatSearch(query: string) {
  const q = query.trim()
  return useQuery({
    queryKey: ['chat-search', q],
    queryFn: async () => {
      const { data } = await apiClient.get<ChatSearchResponse>('/app/chat/search/', {
        params: { q },
      })
      return data
    },
    enabled: q.length >= CHAT_SEARCH_MIN_LEN,
    staleTime: 15_000,
  })
}
