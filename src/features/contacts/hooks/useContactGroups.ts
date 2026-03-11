import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ContactGroup } from '../types'

interface ContactGroupsResponse {
  results: ContactGroup[]
  count: number
}

export function useContactGroups() {
  return useQuery({
    queryKey: ['contact-groups'],
    queryFn: async () => {
      const { data } = await apiClient.get<ContactGroupsResponse>('/app/contacts/groups/')
      return data
    },
    staleTime: 60_000,
    select: (data) => data.results as ContactGroup[],
  })
}
