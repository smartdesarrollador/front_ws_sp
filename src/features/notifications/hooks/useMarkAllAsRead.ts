import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export function useMarkAllAsRead() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.post('/app/notifications/read-all/'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ws-notifications'] })
    },
  })
}
