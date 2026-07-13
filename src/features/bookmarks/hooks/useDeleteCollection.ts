import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/app/bookmarks/collections/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmark-collections'] })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}
