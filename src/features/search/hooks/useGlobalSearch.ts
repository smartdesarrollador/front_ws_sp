import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { GlobalSearchResponse, SearchFiltersState } from '../types'

export const MIN_QUERY_LEN = 2

export function useGlobalSearch(query: string, filters: SearchFiltersState) {
  const q = query.trim()
  return useQuery({
    queryKey: ['global-search', q, filters],
    queryFn: async () => {
      const params: Record<string, string> = { q }
      if (filters.types.length > 0) params.types = filters.types.join(',')
      if (filters.dateFrom) params.date_from = filters.dateFrom
      if (filters.dateTo) params.date_to = filters.dateTo
      const { data } = await apiClient.get<GlobalSearchResponse>('/app/search/', { params })
      return data
    },
    enabled: q.length >= MIN_QUERY_LEN,
    staleTime: 30_000,
  })
}
