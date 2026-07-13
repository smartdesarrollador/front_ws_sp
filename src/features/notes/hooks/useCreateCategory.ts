import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { NoteCategory } from '../types'

interface CreateCategoryRequest {
  name: string
  color: string
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      const response = await apiClient.post<NoteCategory>('/app/notes/categories/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-categories'] })
    },
  })
}
