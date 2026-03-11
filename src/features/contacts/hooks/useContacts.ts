import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Contact, ContactFiltersState } from '../types'

interface ContactsResponse {
  results: Contact[]
  count: number
}

export function useContacts(filters: ContactFiltersState) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.search) params.search = filters.search
      if (filters.group_id) params.group_id = filters.group_id
      const { data } = await apiClient.get<ContactsResponse>('/app/contacts/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ contacts: data.results, total: data.count }),
  })
}
