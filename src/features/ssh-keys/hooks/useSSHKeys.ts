import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { SSHKey, SSHKeyFilters } from '../types'

interface SSHKeysResponse {
  results: SSHKey[]
  count: number
}

export function useSSHKeys(filters: SSHKeyFilters) {
  return useQuery({
    queryKey: ['ssh-keys', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.search) params.search = filters.search
      const { data } = await apiClient.get<SSHKeysResponse>('/app/ssh-keys/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ sshKeys: data.results, total: data.count }),
  })
}
