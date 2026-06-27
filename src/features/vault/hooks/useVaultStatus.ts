import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { VaultStatus } from '../types'

export function useVaultStatus() {
  return useQuery({
    queryKey: ['vault-status'],
    queryFn: async () => {
      const { data } = await apiClient.get<VaultStatus>('/app/vault/master-password/')
      return data
    },
    staleTime: 30_000,
  })
}
