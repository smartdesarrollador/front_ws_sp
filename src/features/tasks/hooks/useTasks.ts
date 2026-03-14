import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Task, TaskFiltersState } from '../types'

interface TasksResponse {
  tasks: Task[]
}

export function useTasks(filters: TaskFiltersState) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      const { data } = await apiClient.get<TasksResponse>('/app/tasks/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ tasks: data.tasks, total: data.tasks.length }),
  })
}
