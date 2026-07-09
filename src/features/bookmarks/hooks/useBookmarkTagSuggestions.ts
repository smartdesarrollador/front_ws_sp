import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface BookmarkTagsResponse {
  tags: string[]
}

export function useBookmarkTagSuggestions() {
  return useQuery({
    queryKey: ['bookmarks', 'tags'],
    queryFn: async () => {
      const { data } = await apiClient.get<BookmarkTagsResponse>('/app/bookmarks/tags/')
      return data.tags
    },
    staleTime: 30_000,
  })
}
