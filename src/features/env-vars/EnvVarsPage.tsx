import { useState } from 'react'
import { Plus, Terminal } from 'lucide-react'
import { useEnvVars } from './hooks/useEnvVars'
import { useDeleteEnvVar } from './hooks/useDeleteEnvVar'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import FeatureGate from '@/components/shared/FeatureGate'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import { EnvVarFilters } from './components/EnvVarFilters'
import { EnvVarRow } from './components/EnvVarRow'
import { EnvVarModal } from './components/EnvVarModal'
import type { EnvVariable, EnvVarsFilters } from './types'

const ENV_VARS_STARTER_LIMIT = 25

export default function EnvVarsPage() {
  const [filters, setFilters] = useState<EnvVarsFilters>({})
  const [showModal, setShowModal] = useState(false)
  const [envVarToEdit, setEnvVarToEdit] = useState<EnvVariable | null>(null)

  const { data, isLoading } = useEnvVars(filters)
  const deleteEnvVar = useDeleteEnvVar()
  const { getLimit } = useFeatureGate()

  const envVars = data?.envVars ?? []
  const total = data?.total ?? 0

  // Plan limit banner — env_vars is not a typed key in FeaturesResponse['limits'],
  // so we cast getLimit to accept any string for plan-gated dynamic feature keys.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawLimit: number | null = (getLimit as unknown as (key: string) => number | null)(
    'env_vars',
  )
  const limit = rawLimit ?? ENV_VARS_STARTER_LIMIT
  const showPlanBanner = rawLimit !== null && total >= limit * 0.8

  const handleEdit = (envVar: EnvVariable) => {
    setEnvVarToEdit(envVar)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    deleteEnvVar.mutate(id)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEnvVarToEdit(null)
  }

  return (
    <FeatureGate
      feature="env_vars"
      fallback={<UpgradePrompt feature="Variables de Entorno" message="Actualiza al plan Starter para gestionar variables de entorno." />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Variables de Entorno
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {total}
            </span>
          </div>
          {/* Nota: las variables de entorno son secretos (valores cifrados) y
              por seguridad NO se exportan. Ver backup completo en Ajustes. */}
          <button
            onClick={() => {
              setEnvVarToEdit(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Variable
          </button>
        </div>

        {/* Plan limit banner */}
        {showPlanBanner && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
            Has alcanzado el {Math.round((total / limit) * 100)}% del límite de variables de
            entorno de tu plan ({total}/{limit}). Considera actualizar tu plan.
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <EnvVarFilters filters={filters} onChange={setFilters} totalCount={total} />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Variable
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entorno
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : envVars.length === 0 ? (
            <div className="text-center py-16">
              <Terminal className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                No hay variables de entorno
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Crea tu primera variable de entorno
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Variable
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entorno
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {envVars.map((envVar) => (
                  <EnvVarRow
                    key={envVar.id}
                    envVar={envVar}
                    onEdit={() => handleEdit(envVar)}
                    onDelete={() => handleDelete(envVar.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && <EnvVarModal envVar={envVarToEdit} onClose={handleCloseModal} />}
      </div>
    </FeatureGate>
  )
}
