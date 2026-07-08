import { useState } from 'react'
import { Check, Copy, Eye, EyeOff, X } from 'lucide-react'
import { VAULT_TYPES } from '../itemTypes'
import { VaultItemTypeBadge } from './VaultItemTypeBadge'
import type { SharedVaultItemRevealed } from '../types'

interface Props {
  item: SharedVaultItemRevealed
  onClose: () => void
}

export function SharedVaultItemViewModal({ item, onClose }: Props) {
  const [shown, setShown] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const fields = VAULT_TYPES[item.item_type].fields

  const copyField = async (name: string) => {
    await navigator.clipboard.writeText(item.data[name] ?? '')
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shared-vault-view-title"
        className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <div>
            <h2 id="shared-vault-view-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {item.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Compartido por {item.shared_by_name} · solo lectura
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <VaultItemTypeBadge type={item.item_type} />

          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type={field.secret && !shown[field.name] ? 'password' : 'text'}
                  value={item.data[field.name] ?? ''}
                  readOnly
                  aria-label={field.label}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 text-sm"
                />
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

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
