import { useRef } from 'react'
import { X, Copy, Check, Mail, Phone, Building2, Share2 } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { GroupBadge } from './GroupBadge'
import type { Contact } from '../types'

interface Props {
  contact: Contact | null
  open: boolean
  onClose: () => void
}

export function ContactViewModal({ contact, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, open)

  const [nameCopied, copyName] = useCopyToClipboard()
  const [emailCopied, copyEmail] = useCopyToClipboard()

  if (!open || !contact) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-view-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 min-w-0">
            <h2
              id="contact-view-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate"
            >
              {contact.name}
            </h2>
            <button
              type="button"
              onClick={() => copyName(contact.name)}
              aria-label="Copiar nombre"
              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded flex-shrink-0"
            >
              {nameCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {(contact.group || contact.is_shared) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {contact.group && <GroupBadge group={contact.group} />}
              {contact.is_shared && (
                <span
                  title={
                    contact.shared_by_name
                      ? `Compartido por ${contact.shared_by_name}`
                      : 'Compartido contigo'
                  }
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
                >
                  <Share2 className="w-3 h-3" />
                  Compartido
                </span>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <button
                type="button"
                onClick={() => copyEmail(contact.email)}
                aria-label="Copiar email"
                className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
              >
                {emailCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {contact.email}
            </div>
          </div>

          {contact.phone && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Teléfono
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {contact.phone}
              </div>
            </div>
          )}

          {contact.company && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Empresa
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {contact.company}
                {contact.job_title ? ` · ${contact.job_title}` : ''}
              </div>
            </div>
          )}

          {contact.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas
              </label>
              <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {contact.notes}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>Creado: {new Date(contact.created_at).toLocaleDateString('es-ES')}</span>
            {contact.updated_at !== contact.created_at && (
              <span>Actualizado: {new Date(contact.updated_at).toLocaleDateString('es-ES')}</span>
            )}
          </div>

          <div className="flex justify-end pt-2">
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
    </div>
  )
}
