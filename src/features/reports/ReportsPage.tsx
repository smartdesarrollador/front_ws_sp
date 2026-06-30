import FeatureGate from '@/components/shared/FeatureGate'
import { useSummary } from './hooks/useSummary'
import { useUsageReport } from './hooks/useUsageReport'
import { useDevOpsReport } from './hooks/useDevOpsReport'
import { KpiCards } from './components/KpiCards'
import { ResourceDistributionChart } from './components/ResourceDistributionChart'
import { TaskPriorityChart } from './components/TaskPriorityChart'
import { CompletionRateChart } from './components/CompletionRateChart'
import { OverdueTasksList } from './components/OverdueTasksList'
import { SSLExpiryWidget } from './components/SSLExpiryWidget'
import { SecretsHygieneWidget } from './components/SecretsHygieneWidget'
import { SnippetLanguageChart } from './components/SnippetLanguageChart'
import { ActivitySection } from './components/ActivitySection'
import { PlanUsagePanel } from './components/PlanUsagePanel'
import { UsageTrendsChart } from './components/UsageTrendsChart'
import { ExportReportButton } from './components/ExportReportButton'

export default function ReportsPage() {
  const { summary, isLoading: loadingSummary } = useSummary()
  const { usage, isLoading: loadingUsage } = useUsageReport()
  const { devops, isLoading: loadingDevops } = useDevOpsReport()

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

        {/* Second charts row: priority distribution + completion rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Distribución por Prioridad
            </h3>
            <TaskPriorityChart usage={usage} isLoading={loadingUsage} />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Tasa de finalización
            </h3>
            <CompletionRateChart summary={summary} isLoading={loadingSummary} />
          </div>
        </div>

        {/* Overdue tasks */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Tareas vencidas
          </h3>
          <OverdueTasksList usage={usage} isLoading={loadingUsage} />
        </div>

        {/* DevOps section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">DevOps</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Certificados SSL
              </h3>
              <SSLExpiryWidget devops={devops} isLoading={loadingDevops} />
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Higiene de secretos
              </h3>
              <SecretsHygieneWidget devops={devops} isLoading={loadingDevops} />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Snippets por lenguaje
            </h3>
            <SnippetLanguageChart devops={devops} isLoading={loadingDevops} />
          </div>
        </div>

        {/* Activity section (gated Professional+ inside) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Actividad</h2>
          <ActivitySection />
        </div>

        {/* Plan usage */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Uso vs plan
          </h3>
          <PlanUsagePanel summary={summary} isLoading={loadingSummary} />
        </div>

        {/* Export */}
        <div className="flex justify-end">
          <ExportReportButton />
        </div>
      </div>
    </FeatureGate>
  )
}
