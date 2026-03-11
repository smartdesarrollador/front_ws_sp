import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { TaskComment } from '../types'

interface AddCommentInput {
  taskId: string
  content: string
}

export function useTaskComments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, content }: AddCommentInput) => {
      const response = await apiClient.post<TaskComment>(`/app/tasks/${taskId}/comments/`, { content })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
