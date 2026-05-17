import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface CreateSharePayload {
  resource_type: 'snippet' | 'note' | 'contact'
  resource_id: string
  shared_with_email: string
  permission_level: 'viewer' | 'editor' | 'admin'
  expires_at?: string | null
}

export function useCreateShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateSharePayload) => {
      const { data } = await apiClient.post('/app/sharing/', payload)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['shares', variables.resource_type, variables.resource_id],
      })
      queryClient.invalidateQueries({ queryKey: ['shared-with-me'] })
    },
  })
}
