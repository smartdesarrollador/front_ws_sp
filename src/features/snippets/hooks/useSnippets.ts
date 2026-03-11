import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CodeSnippet, SnippetFiltersState } from '../types'

interface SnippetsResponse {
  results: CodeSnippet[]
  count: number
}

export function useSnippets(filters: SnippetFiltersState) {
  return useQuery({
    queryKey: ['snippets', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.search) params.search = filters.search
      if (filters.language) params.language = filters.language
      if (filters.tag) params.tag = filters.tag
      const { data } = await apiClient.get<SnippetsResponse>('/app/snippets/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ snippets: data.results, total: data.count }),
  })
}
