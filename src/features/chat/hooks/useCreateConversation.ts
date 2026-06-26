import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ConversationDetail, CreateConversationRequest } from '../types'

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateConversationRequest) => {
      const { data } = await apiClient.post<ConversationDetail>(
        '/app/chat/conversations/',
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
    },
  })
}
