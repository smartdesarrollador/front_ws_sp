import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ProjectDetail, ProjectSection } from '../types'

export function useProjectDetail(id: string) {
  const query = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ProjectDetail>(`/app/projects/${id}/`)
      return data
    },
    staleTime: 30_000,
    enabled: !!id,
  })

  return {
    project: query.data,
    sections: query.data?.sections ?? ([] as ProjectSection[]),
    isLoading: query.isLoading,
  }
}
