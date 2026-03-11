import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateBookmarkRequest, Bookmark } from '../types'

export function useCreateBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateBookmarkRequest) => {
      const response = await apiClient.post<Bookmark>('/app/bookmarks/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
