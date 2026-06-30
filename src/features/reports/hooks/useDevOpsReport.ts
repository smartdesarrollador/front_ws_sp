import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { DevOpsReport } from '../types'

export function useDevOpsReport() {
  const { data: devops, isLoading } = useQuery({
    queryKey: ['ws-reports-devops'],
    queryFn: () => apiClient.get<DevOpsReport>('/app/reports/devops/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { devops, isLoading }
}
