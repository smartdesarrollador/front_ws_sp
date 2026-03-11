import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateNoteRequest, Note } from '../types'

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateNoteRequest) => {
      const response = await apiClient.post<Note>('/app/notes/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
