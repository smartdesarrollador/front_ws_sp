import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

/**
 * Elimina (soft-delete) un mensaje propio. Borra su adjunto y libera la cuota de almacenamiento.
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; conversation: string }) => {
      await apiClient.delete(`/app/chat/messages/${id}/`)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.conversation] })
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
    },
  })
}
