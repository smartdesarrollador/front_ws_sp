import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Message, SendMessageRequest } from '../types'

interface SendVariables {
  conversation: string
  content?: string
  reply_to?: string
  file?: File | null
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: SendVariables) => {
      if (vars.file) {
        // Multipart: let the browser set the Content-Type boundary.
        const form = new FormData()
        form.append('conversation', vars.conversation)
        if (vars.content) form.append('content', vars.content)
        if (vars.reply_to) form.append('reply_to', vars.reply_to)
        form.append('file', vars.file)
        const { data } = await apiClient.post<Message>('/app/chat/messages/', form)
        return data
      }
      const payload: SendMessageRequest = {
        conversation: vars.conversation,
        content: vars.content ?? '',
        reply_to: vars.reply_to,
      }
      const { data } = await apiClient.post<Message>('/app/chat/messages/', payload)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.conversation] })
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
    },
  })
}
