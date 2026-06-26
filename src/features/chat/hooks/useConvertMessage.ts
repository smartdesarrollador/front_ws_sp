import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ConvertMessageRequest, ConvertMessageResponse } from '../types'

export function useConvertMessage() {
  return useMutation({
    mutationFn: async ({
      messageId,
      payload,
    }: {
      messageId: string
      payload: ConvertMessageRequest
    }) => {
      const { data } = await apiClient.post<ConvertMessageResponse>(
        `/app/chat/messages/${messageId}/convert/`,
        payload,
      )
      return data
    },
  })
}
