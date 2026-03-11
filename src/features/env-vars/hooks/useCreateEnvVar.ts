import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateEnvVarRequest, EnvVariable } from '../types'

export function useCreateEnvVar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateEnvVarRequest) => {
      const response = await apiClient.post<EnvVariable>('/app/env-vars/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['env-vars'] })
    },
  })
}
