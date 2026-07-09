import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ContactGroup } from '../types'

interface CreateContactGroupRequest {
  name: string
  color: string
}

export function useCreateContactGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateContactGroupRequest) => {
      const response = await apiClient.post<ContactGroup>('/app/contacts/groups/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] })
    },
  })
}
