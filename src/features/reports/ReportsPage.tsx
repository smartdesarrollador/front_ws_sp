import FeatureGate from '@/components/shared/FeatureGate'
import { useSummary } from './hooks/useSummary'
import { useUsageReport } from './hooks/useUsageReport'
import { KpiCards } from './components/KpiCards'
import { ResourceDistributionChart } from './components/ResourceDistributionChart'
import { UsageTrendsChart } from './components/UsageTrendsChart'
import { ExportReportButton } from './components/ExportReportButton'

export default function ReportsPage() {
  const { summary, isLoading: loadingSummary } = useSummary()
  const { usage, isLoading: loadingUsage } = useUsageReport()

  return (
    <FeatureGate feature="analytics">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>
          {summary && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {summary.active_tasks} activas
            </span>
          )}
        </div>

        <KpiCards summary={summary} isLoading={loadingSummary} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Distribución por Estado
            </h3>
            <ResourceDistributionChart usage={usage} isLoading={loadingUsage} />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Tendencias de Uso
            </h3>
            <UsageTrendsChart />
          </div>
        </div>

        {/* Export */}
        <div className="flex justify-end">
          <ExportReportButton />
        </div>
      </div>
    </FeatureGate>
  )
}
