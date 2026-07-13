import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { BookmarkCollection } from '../types'

interface CreateCollectionRequest {
  name: string
  color: string
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCollectionRequest) => {
      const response = await apiClient.post<BookmarkCollection>('/app/bookmarks/collections/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmark-collections'] })
    },
  })
}
