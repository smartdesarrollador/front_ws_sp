import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ImportSummary } from '@/components/shared/ImportModal'
import type { ParsedContact } from '@/lib/import'

export function useImportContacts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (items: ParsedContact[]): Promise<ImportSummary> => {
      const { data } = await apiClient.post<ImportSummary>('/app/contacts/import/', {
        items,
        source: 'file',
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
