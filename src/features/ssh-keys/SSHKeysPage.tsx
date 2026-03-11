import { useState } from 'react'
import { Plus, KeyRound, Search } from 'lucide-react'
import { useSSHKeys } from './hooks/useSSHKeys'
import { useDeleteSSHKey } from './hooks/useDeleteSSHKey'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import FeatureGate from '@/components/shared/FeatureGate'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import { SSHKeyCard } from './components/SSHKeyCard'
import { SSHKeyModal } from './components/SSHKeyModal'
import type { SSHKey } from './types'

const SSH_KEYS_FREE_LIMIT = 2

export default function SSHKeysPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [sshKeyToEdit, setSshKeyToEdit] = useState<SSHKey | null>(null)

  const { data, isLoading } = useSSHKeys({ search: search || undefined })
  const deleteSSHKey = useDeleteSSHKey()
  const { getLimit } = useFeatureGate()

  const sshKeys = data?.sshKeys ?? []
  const total = data?.total ?? 0

  // Plan limit banner — ssh_keys is not a typed key in FeaturesResponse['limits'],
  // so we cast getLimit to accept any string for plan-gated dynamic feature keys.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawLimit: number | null = (getLimit as unknown as (key: string) => number | null)(
    'ssh_keys',
  )
  const limit = rawLimit ?? SSH_KEYS_FREE_LIMIT
  const showPlanBanner = rawLimit !== null && total >= limit * 0.8

  const handleEdit = (sshKey: SSHKey) => {
    setSshKeyToEdit(sshKey)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    deleteSSHKey.mutate(id)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSshKeyToEdit(null)
  }

  return (
    <FeatureGate
      feature="ssh_keys"
      fallback={
        <UpgradePrompt
          feature="Claves SSH"
          message="Actualiza tu plan para gestionar claves SSH."
        />
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Claves SSH</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {total}
            </span>
          </div>
          <button
            onClick={() => {
              setSshKeyToEdit(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Clave SSH
          </button>
        </div>

        {/* Plan limit banner */}
        {showPlanBanner && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
            Has alcanzado el {Math.round((total / limit) * 100)}% del límite de claves SSH de tu
            plan ({total}/{limit}). Considera actualizar tu plan.
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar claves SSH..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
            ))}
          </div>
        ) : sshKeys.length === 0 ? (
          <div className="text-center py-16">
            <KeyRound className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
              No hay claves SSH
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Crea tu primera clave SSH
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sshKeys.map((sshKey) => (
              <SSHKeyCard
                key={sshKey.id}
                sshKey={sshKey}
                onEdit={() => handleEdit(sshKey)}
                onDelete={() => handleDelete(sshKey.id)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && <SSHKeyModal sshKey={sshKeyToEdit} onClose={handleCloseModal} />}
      </div>
    </FeatureGate>
  )
}
