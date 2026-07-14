import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Note, NoteFiltersState, NotePagination } from '../types'

const PAGE_SIZE = 20

interface NotesResponse {
  notes: Note[]
  pagination: NotePagination
}

export function useNotes(filters: NoteFiltersState, page: number) {
  return useQuery({
    queryKey: ['notes', filters, page],
    queryFn: async () => {
      const params: Record<string, string | boolean | number> = { page, per_page: PAGE_SIZE }
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.pinned_only) params.pinned_only = true
      if (filters.tag) params.tag = filters.tag
      const { data } = await apiClient.get<NotesResponse>('/app/notes/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ notes: data.notes, pagination: data.pagination }),
  })
}
