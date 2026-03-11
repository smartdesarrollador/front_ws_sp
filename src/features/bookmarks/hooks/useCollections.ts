import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { BookmarkCollection } from '../types'

interface CollectionsResponse {
  results: BookmarkCollection[]
  count: number
}

export function useCollections() {
  return useQuery({
    queryKey: ['bookmark-collections'],
    queryFn: async () => {
      const { data } = await apiClient.get<CollectionsResponse>('/app/bookmarks/collections/')
      return data
    },
    staleTime: 60_000,
    select: (data) => data.results as BookmarkCollection[],
  })
}
