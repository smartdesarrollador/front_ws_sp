import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface RevokeShareArgs {
  shareId: string
  resourceType: string
  resourceId: string
}

export function useRevokeShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ shareId }: RevokeShareArgs) => {
      await apiClient.delete(`/app/sharing/${shareId}/delete/`)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['shares', variables.resourceType, variables.resourceId],
      })
      queryClient.invalidateQueries({ queryKey: ['shared-with-me'] })
    },
  })
}
