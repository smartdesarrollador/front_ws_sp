import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Task, TaskFiltersState, TaskPagination } from '../types'

const PAGE_SIZE = 20

interface TasksResponse {
  tasks: Task[]
  pagination: TaskPagination
}

export function useTasks(filters: TaskFiltersState, page: number, paginate: boolean) {
  return useQuery({
    queryKey: ['tasks', filters, paginate ? page : 'all'],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (paginate) {
        params.page = page
        params.per_page = PAGE_SIZE
      }
      const { data } = await apiClient.get<TasksResponse>('/app/tasks/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ tasks: data.tasks, total: data.pagination.total, pagination: data.pagination }),
  })
}
