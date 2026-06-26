import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ConnectionsResponse } from '../types'

export function useConnections(enabled = true) {
  return useQuery({
    queryKey: ['chat-connections'],
    queryFn: async () => {
      const { data } = await apiClient.get<ConnectionsResponse>('/app/chat/connections/')
      return data
    },
    enabled,
    refetchInterval: 15_000,
  })
}
