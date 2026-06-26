import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ConnectionAction } from '../types'

export function useRespondConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: ConnectionAction }) => {
      await apiClient.post(`/app/chat/connections/${id}/respond/`, { action })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-connections'] })
    },
  })
}
