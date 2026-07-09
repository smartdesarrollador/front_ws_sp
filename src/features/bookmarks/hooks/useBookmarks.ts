import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Bookmark, BookmarkFiltersState } from '../types'

interface BookmarksResponse {
  results: Bookmark[]
  count: number
}

export function useBookmarks(filters: BookmarkFiltersState) {
  return useQuery({
    queryKey: ['bookmarks', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.search) params.search = filters.search
      if (filters.collection_id) params.collection = filters.collection_id
      if (filters.tag) params.tag = filters.tag
      const { data } = await apiClient.get<BookmarksResponse>('/app/bookmarks/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ bookmarks: data.results, total: data.count }),
  })
}
