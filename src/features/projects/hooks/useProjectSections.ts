import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateSectionRequest, ProjectSection } from '../types'

interface UpdateSectionInput extends Partial<CreateSectionRequest> {
  projectId: string
  sectionId: string
}

interface DeleteSectionInput {
  projectId: string
  sectionId: string
}

export function useCreateSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, ...data }: CreateSectionRequest & { projectId: string }) => {
      const response = await apiClient.post<ProjectSection>(
        `/app/projects/${projectId}/sections/`,
        data,
      )
      return response.data
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}

export function useUpdateSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, sectionId, ...data }: UpdateSectionInput) => {
      const response = await apiClient.patch<ProjectSection>(
        `/app/projects/${projectId}/sections/${sectionId}/`,
        data,
      )
      return response.data
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}

export function useDeleteSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, sectionId }: DeleteSectionInput) => {
      await apiClient.delete(`/app/projects/${projectId}/sections/${sectionId}/`)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}
