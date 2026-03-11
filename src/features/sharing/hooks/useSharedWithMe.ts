import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { SharedItem } from '../types'

interface SharedWithMeResponse {
  items: SharedItem[]
  total: number
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: ['shared-with-me'],
    queryFn: async () => {
      const { data } = await apiClient.get<SharedWithMeResponse>('/app/sharing/shared-with-me/')
      return data
    },
    staleTime: 30_000,
  })
}
