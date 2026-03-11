import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateItemRequest, ProjectItem } from '../types'

interface UpdateItemInput {
  projectId: string
  itemId: string
  title?: string
  description?: string
}

interface DeleteItemInput {
  projectId: string
  itemId: string
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, ...data }: CreateItemRequest & { projectId: string }) => {
      const response = await apiClient.post<ProjectItem>(
        `/app/projects/${projectId}/items/`,
        data,
      )
      return response.data
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, itemId, ...data }: UpdateItemInput) => {
      const response = await apiClient.patch<ProjectItem>(
        `/app/projects/${projectId}/items/${itemId}/`,
        data,
      )
      return response.data
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, itemId }: DeleteItemInput) => {
      await apiClient.delete(`/app/projects/${projectId}/items/${itemId}/`)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
