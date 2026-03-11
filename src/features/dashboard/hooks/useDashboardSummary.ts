import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { DashboardSummary } from '../types'

export function useDashboardSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiClient.get<DashboardSummary>('/app/reports/summary/').then((r) => r.data),
    staleTime: 60_000,
  })

  return { data, isLoading }
}
