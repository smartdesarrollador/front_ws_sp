import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface RevealFieldParams {
  projectId: string
  itemId: string
  fieldId: string
  onReveal: (value: string) => void
}

interface RevealResponse {
  value: string
}

export function useRevealField({ projectId, itemId, fieldId, onReveal }: RevealFieldParams) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<RevealResponse>(
        `/app/projects/${projectId}/items/${itemId}/fields/${fieldId}/reveal/`,
      )
      return response.data
    },
    onSuccess: (data) => {
      onReveal(data.value)
      setTimeout(() => {
        onReveal('')
      }, 30_000)
    },
  })
}
