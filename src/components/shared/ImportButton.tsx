import { useState, type ReactNode } from 'react'
import { Upload } from 'lucide-react'
import FeatureGate from './FeatureGate'
import { usePermissions } from '@/hooks/usePermissions'

interface Props {
  /** Plan feature flag that unlocks import (e.g. "contact_import"). */
  feature: string
  /** Optional RBAC permission required to see the button. */
  permission?: string
  /** Tooltip shown on the disabled (upgrade) state. */
  disabledHint?: string
  label?: string
  /** Renders the import modal; receives a `close` callback. */
  renderModal: (close: () => void) => ReactNode
}

const BTN_BASE = 'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors'
const BTN_ENABLED =
  'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'

function DisabledImportButton({ hint, label }: { hint?: string; label: string }) {
  return (
    <button
      disabled
      title={hint ?? 'Actualiza tu plan para importar'}
      className={`${BTN_BASE} text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}
    >
      <Upload className="w-4 h-4" />
      {label}
    </button>
  )
}

/**
 * Plan-gated import trigger. Renders an "Importar" button wrapped in a
 * FeatureGate (disabled upgrade fallback); opening it mounts the modal returned
 * by `renderModal`. Optionally hidden when the user lacks an RBAC permission.
 */
export default function ImportButton({ feature, permission, disabledHint, label = 'Importar', renderModal }: Props) {
  const { hasPermission } = usePermissions()
  const [open, setOpen] = useState(false)

  if (permission && !hasPermission(permission)) {
    return null
  }

  return (
    <FeatureGate feature={feature} fallback={<DisabledImportButton hint={disabledHint} label={label} />}>
      <button onClick={() => setOpen(true)} className={`${BTN_BASE} ${BTN_ENABLED}`}>
        <Upload className="w-4 h-4" />
        {label}
      </button>
      {open && renderModal(() => setOpen(false))}
    </FeatureGate>
  )
}
