import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Lock, Plus, ShieldCheck } from 'lucide-react'
import FeatureGate from '@/components/shared/FeatureGate'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import { useVaultStore } from '@/store/vaultStore'
import { useVaultStatus } from './hooks/useVaultStatus'
import { useVaultItems } from './hooks/useVaultItems'
import { useLockVault } from './hooks/useLockVault'
import { useRevealVaultItem, useDeleteVaultItem } from './hooks/useVaultItemMutations'
import { UnlockPrompt } from './components/UnlockPrompt'
import { VaultItemRow } from './components/VaultItemRow'
import { VaultItemModal } from './components/VaultItemModal'
import type { VaultItem, VaultItemRevealed } from './types'

export default function VaultPage() {
  return (
    <FeatureGate
      feature="vault"
      fallback={
        <UpgradePrompt
          feature="Bóveda"
          message="Actualiza tu plan para guardar datos protegidos con contraseña maestra."
        />
      }
    >
      <VaultContent />
    </FeatureGate>
  )
}

function VaultContent() {
  const isUnlockedFn = useVaultStore((s) => s.isUnlocked)
  const expiresAt = useVaultStore((s) => s.expiresAt)
  const [, setTick] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<VaultItemRevealed | null>(null)

  const { data: status, isLoading: loadingStatus } = useVaultStatus()
  const unlocked = isUnlockedFn()
  const { data: itemsData, isLoading: loadingItems } = useVaultItems({}, Boolean(status?.is_configured))
  const lockVault = useLockVault()
  const revealItem = useRevealVaultItem()
  const deleteItem = useDeleteVaultItem()

  const items = itemsData?.items ?? []

  // Re-render when the unlock token expires so the UnlockPrompt reappears.
  useEffect(() => {
    if (!expiresAt) return
    const ms = Math.max(0, expiresAt - Date.now())
    const t = setTimeout(() => setTick((n) => n + 1), ms + 250)
    return () => clearTimeout(t)
  }, [expiresAt])

  const handleReveal = (item: VaultItem) => {
    revealItem.mutate(item.id, {
      onSuccess: (revealed) => {
        setItemToEdit(revealed)
        setShowModal(true)
      },
    })
  }

  const handleNew = () => {
    setItemToEdit(null)
    setShowModal(true)
  }

  if (loadingStatus) {
    return <div className="py-20 text-center text-sm text-gray-400">Cargando...</div>
  }

  // Not configured → guide to Settings to create a master password.
  if (!status?.is_configured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Configura tu Bóveda</h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          Crea una contraseña maestra para guardar datos protegidos (logins, API keys, notas seguras).
        </p>
        <Link
          to="/settings"
          className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Ir a Configuración
        </Link>
      </div>
    )
  }

  if (!unlocked) {
    return <UnlockPrompt />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bóveda</h1>
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => lockVault.mutate()}
            className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Lock className="h-4 w-4" />
            Bloquear
          </button>
          <button
            type="button"
            onClick={handleNew}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo elemento
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {loadingItems ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando elementos...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <KeyRound className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Bóveda vacía</h3>
            <p className="text-sm text-gray-500">Guarda tu primer dato protegido.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <VaultItemRow
                  key={item.id}
                  item={item}
                  onReveal={handleReveal}
                  onDelete={(id) => deleteItem.mutate(id)}
                  isRevealing={revealItem.isPending}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <VaultItemModal item={itemToEdit} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
