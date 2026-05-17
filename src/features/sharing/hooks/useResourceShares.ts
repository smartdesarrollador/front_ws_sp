import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ShareRecord } from '../types'

interface ResourceSharesResponse {
  shares: ShareRecord[]
}

export function useResourceShares(resourceType: string, resourceId: string) {
  return useQuery({
    queryKey: ['shares', resourceType, resourceId],
    queryFn: async () => {
      const { data } = await apiClient.get<ResourceSharesResponse>('/app/sharing/', {
        params: { resource_type: resourceType, resource_id: resourceId },
      })
      return data.shares
    },
    enabled: !!resourceType && !!resourceId,
    staleTime: 30_000,
  })
}
