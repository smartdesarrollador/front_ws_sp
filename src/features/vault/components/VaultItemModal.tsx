import { useState } from 'react'
import { Check, Copy, Eye, EyeOff, X } from 'lucide-react'
import { VAULT_TYPES } from '../itemTypes'
import { useCreateVaultItem, useUpdateVaultItem } from '../hooks/useVaultItemMutations'
import type { VaultData, VaultItemRevealed, VaultItemType } from '../types'

interface VaultItemModalProps {
  item: VaultItemRevealed | null
  onClose: () => void
}

export function VaultItemModal({ item, onClose }: VaultItemModalProps) {
  const isEdit = item !== null
  const [title, setTitle] = useState(item?.title ?? '')
  const [type, setType] = useState<VaultItemType>(item?.item_type ?? 'login')
  const [data, setData] = useState<VaultData>(item?.data ?? {})
  const [shown, setShown] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const create = useCreateVaultItem()
  const update = useUpdateVaultItem()
  const isPending = create.isPending || update.isPending

  const fields = VAULT_TYPES[type].fields

  const setField = (name: string, value: string) => setData((d) => ({ ...d, [name]: value }))

  const copyField = async (name: string) => {
    await navigator.clipboard.writeText(data[name] ?? '')
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { title, item_type: type, data }
    if (isEdit) {
      update.mutate({ id: item.id, payload }, { onSuccess: onClose })
    } else {
      create.mutate(payload, { onSuccess: onClose })
    }
  }

  const overLimit =
    (create.error as { response?: { status?: number } })?.response?.status === 402

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vault-modal-title"
        className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <h2 id="vault-modal-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {isEdit ? 'Editar elemento' : 'Nuevo elemento'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              aria-label="Título"
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as VaultItemType)}
              disabled={isEdit}
              aria-label="Tipo"
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60"
            >
              {Object.entries(VAULT_TYPES).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </label>
              <div className="mt-1 flex items-center gap-2">
                {field.textarea ? (
                  <textarea
                    value={data[field.name] ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    aria-label={field.label}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                ) : (
                  <input
                    type={field.secret && !shown[field.name] ? 'password' : 'text'}
                    value={data[field.name] ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    aria-label={field.label}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                )}
                {field.secret && (
                  <button
                    type="button"
                    onClick={() => setShown((s) => ({ ...s, [field.name]: !s[field.name] }))}
                    aria-label={shown[field.name] ? 'Ocultar' : 'Mostrar'}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {shown[field.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => copyField(field.name)}
                  aria-label={`Copiar ${field.label}`}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {copied === field.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}

          {overLimit && (
            <p className="text-sm text-red-600">
              Has alcanzado el límite de elementos de tu plan. Actualiza tu plan para añadir más.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !title}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
