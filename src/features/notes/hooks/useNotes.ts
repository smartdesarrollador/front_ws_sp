import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Note, NoteFiltersState } from '../types'

interface NotesResponse {
  results: Note[]
  count: number
}

export function useNotes(filters: NoteFiltersState) {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: async () => {
      const params: Record<string, string | boolean> = {}
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.pinned_only) params.pinned_only = true
      const { data } = await apiClient.get<NotesResponse>('/app/notes/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ notes: data.results, total: data.count }),
  })
}
