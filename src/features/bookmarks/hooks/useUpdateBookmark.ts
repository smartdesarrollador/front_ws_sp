import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { UpdateBookmarkRequest, Bookmark } from '../types'

interface UpdateBookmarkInput extends UpdateBookmarkRequest {
  id: string
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateBookmarkInput) => {
      const response = await apiClient.patch<Bookmark>(`/app/bookmarks/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}
