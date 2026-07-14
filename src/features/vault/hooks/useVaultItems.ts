import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { VaultItem, VaultItemsFilters, VaultItemsPagination } from '../types'

const PAGE_SIZE = 20

interface VaultItemsResponse {
  items: VaultItem[]
  pagination: VaultItemsPagination
}

export function useVaultItems(filters: VaultItemsFilters, page: number, enabled = true) {
  return useQuery({
    queryKey: ['vault-items', filters, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: PAGE_SIZE }
      if (filters.search) params.search = filters.search
      if (filters.item_type) params.item_type = filters.item_type
      const { data } = await apiClient.get<VaultItemsResponse>('/app/vault/items/', { params })
      return data
    },
    enabled,
    staleTime: 30_000,
    select: (data) => ({ items: data.items, pagination: data.pagination }),
  })
}
