import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export function useDeleteContactGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/app/contacts/groups/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
