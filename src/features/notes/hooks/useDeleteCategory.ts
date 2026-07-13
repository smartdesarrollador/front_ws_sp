import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/app/notes/categories/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-categories'] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
