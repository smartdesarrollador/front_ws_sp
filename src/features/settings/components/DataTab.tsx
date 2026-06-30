import { Archive } from 'lucide-react'
import ExportMenu, { type ExportFormat } from '@/components/shared/ExportMenu'
import { useWorkspaceBackup } from '../hooks/useWorkspaceBackup'

/**
 * "Datos y privacidad" — full account backup (portability). Generates a ZIP of
 * all exportable resources via the backend. Secrets (vault, env vars, SSH keys,
 * passwords) are never included; the action is audited server-side.
 */
export default function DataTab() {
  const backup = useWorkspaceBackup()

  const formats: ExportFormat[] = [
    {
      id: 'zip',
      label: 'Backup completo (.zip)',
      run: () => backup.mutateAsync(),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Datos y privacidad</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Descarga una copia de todos tus datos (portabilidad).
        </p>
      </div>

      <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Archive className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">Backup completo</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Un archivo ZIP con tus notas, tareas, snippets, contactos, bookmarks, eventos y
            proyectos en formato JSON. Por seguridad, los secretos (bóveda, variables de entorno,
            claves SSH y contraseñas) no se incluyen.
          </p>
          {backup.isError && (
            <p className="mt-2 text-sm text-red-600">
              No se pudo generar el backup. Inténtalo de nuevo.
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <ExportMenu
            feature="full_backup"
            formats={formats}
            label="Exportar todo"
            disabledHint="El backup completo está disponible en el plan Professional o superior"
          />
        </div>
      </div>
    </div>
  )
}
