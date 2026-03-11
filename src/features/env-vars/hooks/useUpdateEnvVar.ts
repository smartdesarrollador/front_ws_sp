import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { UpdateEnvVarRequest, EnvVariable } from '../types'

export function useUpdateEnvVar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateEnvVarRequest) => {
      const response = await apiClient.patch<EnvVariable>(`/app/env-vars/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['env-vars'] })
    },
  })
}
