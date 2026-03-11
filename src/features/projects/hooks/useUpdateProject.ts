import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { UpdateProjectRequest, Project } from '../types'

interface UpdateProjectInput extends UpdateProjectRequest {
  id: string
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProjectInput) => {
      const response = await apiClient.patch<Project>(`/app/projects/${id}/`, data)
      return response.data
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
    },
  })
}
