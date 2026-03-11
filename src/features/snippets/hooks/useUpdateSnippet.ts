import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { UpdateSnippetRequest, CodeSnippet } from '../types'

interface UpdateSnippetInput extends UpdateSnippetRequest {
  id: string
}

export function useUpdateSnippet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateSnippetInput) => {
      const response = await apiClient.patch<CodeSnippet>(`/app/snippets/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
    },
  })
}
