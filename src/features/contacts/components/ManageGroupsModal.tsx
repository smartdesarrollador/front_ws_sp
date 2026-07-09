import { useRef, useState } from 'react'
import { X, Trash2, Plus } from 'lucide-react'
import { useContactGroups } from '../hooks/useContactGroups'
import { useCreateContactGroup } from '../hooks/useCreateContactGroup'
import { useDeleteContactGroup } from '../hooks/useDeleteContactGroup'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { ContactGroup } from '../types'

const COLOR_PRESETS = [
  '#2563eb', // blue
  '#16a34a', // green
  '#dc2626', // red
  '#9333ea', // purple
  '#d97706', // amber
  '#0891b2', // cyan
  '#db2777', // pink
  '#65a30d', // lime
]

interface Props {
  onClose: () => void
}

function GroupRow({ group }: { group: ContactGroup }) {
  const [confirming, setConfirming] = useState(false)
  const deleteGroup = useDeleteContactGroup()

  return (
    <div className="py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: group.color }}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {group.name}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            {group.contacts_count} contactos
          </span>
        </div>
        {!confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Eliminar grupo ${group.name}`}
            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {confirming && (
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {group.contacts_count > 0
              ? `${group.contacts_count} contactos quedarán sin grupo. ¿Confirmar?`
              : '¿Confirmar?'}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => deleteGroup.mutate(group.id, { onSuccess: () => setConfirming(false) })}
              className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ManageGroupsModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)
  const { data: groups = [] } = useContactGroups()
  const createGroup = useCreateContactGroup()

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0])

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    createGroup.mutate(
      { name, color: newColor },
      { onSuccess: () => setNewName('') },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-groups-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="manage-groups-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Gestionar grupos
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {groups.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No hay grupos aún
            </p>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <GroupRow key={group.id} group={group} />
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nuevo grupo
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del grupo"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Color ${color}`}
                  onClick={() => setNewColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                    newColor === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim() || createGroup.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createGroup.isPending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Agregar grupo
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
