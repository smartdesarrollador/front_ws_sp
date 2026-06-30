import { useState } from 'react'
import { Download, ChevronDown, Loader2 } from 'lucide-react'
import FeatureGate from './FeatureGate'
import { usePermissions } from '@/hooks/usePermissions'

export interface ExportFormat {
  /** Stable id (used as React key and test target). */
  id: string
  /** Visible label, e.g. "CSV", "vCard (.vcf)". */
  label: string
  /** Performs the export. May be async (e.g. ZIP generation). */
  run: () => void | Promise<void>
}

interface Props {
  /** Plan feature flag that unlocks this export (e.g. "notes_export"). */
  feature: string
  /** Optional RBAC permission required to see the menu (e.g. "notes.read"). */
  permission?: string
  /** Available formats; a single format renders a plain button. */
  formats: ExportFormat[]
  /** Tooltip shown on the disabled (upgrade) state. */
  disabledHint?: string
  /** Button label (default "Exportar"). */
  label?: string
}

const BTN_BASE =
  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors'
const BTN_ENABLED =
  'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'

function DisabledExportButton({ hint, label }: { hint?: string; label: string }) {
  return (
    <button
      disabled
      title={hint ?? 'Actualiza tu plan para exportar'}
      className={`${BTN_BASE} text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  )
}

function ExportMenuInner({ formats, label }: { formats: ExportFormat[]; label: string }) {
  const [open, setOpen] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const handleRun = async (fmt: ExportFormat) => {
    setBusyId(fmt.id)
    try {
      await fmt.run()
    } finally {
      setBusyId(null)
      setOpen(false)
    }
  }

  // Single format → plain button, no dropdown.
  if (formats.length === 1) {
    const fmt = formats[0]
    return (
      <button
        onClick={() => handleRun(fmt)}
        disabled={busyId !== null}
        className={`${BTN_BASE} ${BTN_ENABLED} disabled:opacity-60`}
      >
        {busyId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {label}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${BTN_BASE} ${BTN_ENABLED}`}
      >
        <Download className="w-4 h-4" />
        {label}
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1"
          >
            {formats.map((fmt) => (
              <button
                key={fmt.id}
                role="menuitem"
                onClick={() => handleRun(fmt)}
                disabled={busyId !== null}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
              >
                {busyId === fmt.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-gray-400" />
                )}
                {fmt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Plan-gated export control. Renders a "Exportar" button (or dropdown when
 * given multiple formats), wrapped in a FeatureGate with a disabled upgrade
 * fallback. Optionally hidden when the user lacks an RBAC permission.
 */
export default function ExportMenu({ feature, permission, formats, disabledHint, label = 'Exportar' }: Props) {
  const { hasPermission } = usePermissions()

  if (permission && !hasPermission(permission)) {
    return null
  }

  return (
    <FeatureGate feature={feature} fallback={<DisabledExportButton hint={disabledHint} label={label} />}>
      <ExportMenuInner formats={formats} label={label} />
    </FeatureGate>
  )
}
