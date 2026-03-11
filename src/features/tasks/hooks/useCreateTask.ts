import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateTaskRequest, Task } from '../types'

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const response = await apiClient.post<Task>('/app/tasks/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
