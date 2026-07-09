import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface SnippetTagsResponse {
  tags: string[]
}

export function useSnippetTagSuggestions() {
  return useQuery({
    queryKey: ['snippets', 'tags'],
    queryFn: async () => {
      const { data } = await apiClient.get<SnippetTagsResponse>('/app/snippets/tags/')
      return data.tags
    },
    staleTime: 30_000,
  })
}
