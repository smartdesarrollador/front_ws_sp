import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateFieldRequest, UpdateFieldRequest, ProjectItemField } from '../types'

interface FieldsParams {
  projectId: string
  itemId: string
}

interface CreateFieldInput extends CreateFieldRequest {
  projectId: string
  itemId: string
}

interface UpdateFieldInput extends UpdateFieldRequest {
  projectId: string
  itemId: string
  fieldId: string
}

interface DeleteFieldInput {
  projectId: string
  itemId: string
  fieldId: string
}

export function useProjectFields({ projectId, itemId }: FieldsParams) {
  return useQuery({
    queryKey: ['fields', itemId],
    queryFn: async () => {
      const { data } = await apiClient.get<ProjectItemField[]>(
        `/app/projects/${projectId}/items/${itemId}/fields/`,
      )
      return data
    },
    enabled: !!itemId,
  })
}

export function useCreateField() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, itemId, ...data }: CreateFieldInput) => {
      const response = await apiClient.post<ProjectItemField>(
        `/app/projects/${projectId}/items/${itemId}/fields/`,
        data,
      )
      return response.data
    },
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['fields', itemId] })
    },
  })
}

export function useUpdateField() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, itemId, fieldId, ...data }: UpdateFieldInput) => {
      const response = await apiClient.patch<ProjectItemField>(
        `/app/projects/${projectId}/items/${itemId}/fields/${fieldId}/`,
        data,
      )
      return response.data
    },
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['fields', itemId] })
    },
  })
}

export function useDeleteField() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, itemId, fieldId }: DeleteFieldInput) => {
      await apiClient.delete(
        `/app/projects/${projectId}/items/${itemId}/fields/${fieldId}/`,
      )
    },
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['fields', itemId] })
    },
  })
}
