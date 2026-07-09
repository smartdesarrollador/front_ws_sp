import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface NoteTagsResponse {
  tags: string[]
}

export function useNoteTagSuggestions() {
  return useQuery({
    queryKey: ['notes', 'tags'],
    queryFn: async () => {
      const { data } = await apiClient.get<NoteTagsResponse>('/app/notes/tags/')
      return data.tags
    },
    staleTime: 30_000,
  })
}
