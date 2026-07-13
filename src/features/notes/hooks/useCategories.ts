import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { NoteCategory } from '../types'

interface CategoriesResponse {
  results: NoteCategory[]
  count: number
}

export function useCategories() {
  return useQuery({
    queryKey: ['note-categories'],
    queryFn: async () => {
      const { data } = await apiClient.get<CategoriesResponse>('/app/notes/categories/')
      return data
    },
    staleTime: 60_000,
    select: (data) => data.results as NoteCategory[],
  })
}
