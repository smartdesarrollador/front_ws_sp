import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Contact, ContactFiltersState, ContactPagination } from '../types'

const PAGE_SIZE = 20

interface ContactsResponse {
  contacts: Contact[]
  pagination: ContactPagination
}

export function useContacts(filters: ContactFiltersState, page: number) {
  return useQuery({
    queryKey: ['contacts', filters, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: PAGE_SIZE }
      if (filters.search) params.search = filters.search
      if (filters.group_id) params.group = filters.group_id
      const { data } = await apiClient.get<ContactsResponse>('/app/contacts/', { params })
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ contacts: data.contacts, pagination: data.pagination }),
  })
}
