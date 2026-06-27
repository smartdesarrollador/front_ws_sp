import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { VaultItem, VaultItemsFilters } from '../types'

interface VaultItemsResponse {
  items: VaultItem[]
  count: number
}

export function useVaultItems(filters: VaultItemsFilters, enabled = true) {
  return useQuery({
    queryKey: ['vault-items', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.search) params.search = filters.search
      if (filters.item_type) params.item_type = filters.item_type
      const { data } = await apiClient.get<VaultItemsResponse>('/app/vault/items/', { params })
      return data
    },
    enabled,
    staleTime: 30_000,
    select: (data) => ({ items: data.items, total: data.count }),
  })
}
