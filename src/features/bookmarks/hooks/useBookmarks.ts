import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Bookmark, BookmarkFiltersState, BookmarkPagination } from '../types'

const PAGE_SIZE = 20

interface BookmarksResponse {
  bookmarks: Bookmark[]
  pagination: BookmarkPagination
}

export function useBookmarks(filters: BookmarkFiltersState, page: number) {
  return useQuery({
    queryKey: ['bookmarks', filters, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: PAGE_SIZE }
      if (filters.search) params.search = filters.search
      if (filters.collection_id) params.collection = filters.collection_id
      if (filters.tag) params.tag = filters.tag
      const { data } = await apiClient.get<BookmarksResponse>('/app/bookmarks/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ bookmarks: data.bookmarks, pagination: data.pagination }),
  })
}
