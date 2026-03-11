import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { EnvVariable, EnvVarsFilters } from '../types'

interface EnvVarsResponse {
  results: EnvVariable[]
  count: number
}

export function useEnvVars(filters: EnvVarsFilters) {
  return useQuery({
    queryKey: ['env-vars', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.search) params.search = filters.search
      if (filters.environment) params.environment = filters.environment
      const { data } = await apiClient.get<EnvVarsResponse>('/app/env-vars/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ envVars: data.results, total: data.count }),
  })
}
