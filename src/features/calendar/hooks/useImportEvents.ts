import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ImportSummary } from '@/components/shared/ImportModal'
import type { ParsedEvent } from '@/lib/import'

export function useImportEvents() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (items: ParsedEvent[]): Promise<ImportSummary> => {
      const { data } = await apiClient.post<ImportSummary>('/app/calendar/import/', {
        items,
        source: 'file',
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
