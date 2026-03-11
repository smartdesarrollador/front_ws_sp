import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { UpdateNoteRequest, Note } from '../types'

interface UpdateNoteInput extends UpdateNoteRequest {
  id: string
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateNoteInput) => {
      const response = await apiClient.patch<Note>(`/app/notes/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
