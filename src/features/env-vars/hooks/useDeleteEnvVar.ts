import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export function useDeleteEnvVar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/app/env-vars/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['env-vars'] })
    },
  })
}
