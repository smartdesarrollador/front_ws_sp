import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateSnippetRequest, CodeSnippet } from '../types'

export function useCreateSnippet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSnippetRequest) => {
      const response = await apiClient.post<CodeSnippet>('/app/snippets/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
