import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CodeSnippet, SnippetFiltersState, SnippetPagination } from '../types'

const PAGE_SIZE = 20

interface SnippetsResponse {
  snippets: CodeSnippet[]
  pagination: SnippetPagination
}

export function useSnippets(filters: SnippetFiltersState, page: number) {
  return useQuery({
    queryKey: ['snippets', filters, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: PAGE_SIZE }
      if (filters.search) params.search = filters.search
      if (filters.language) params.language = filters.language
      if (filters.tag) params.tag = filters.tag
      const { data } = await apiClient.get<SnippetsResponse>('/app/snippets/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ snippets: data.snippets, pagination: data.pagination }),
  })
}
