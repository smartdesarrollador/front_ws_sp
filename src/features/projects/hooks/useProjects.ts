import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Project } from '../types'

interface ProjectsResponse {
  results: Project[]
  count: number
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await apiClient.get<ProjectsResponse>('/app/projects/')
      return data
    },
    staleTime: 60_000,
    select: (data) => ({ projects: data.results, total: data.count }),
  })
}
