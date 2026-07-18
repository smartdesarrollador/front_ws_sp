import { Pencil, Trash2, Mail, Phone, Building2, Share2, Copy, Check, Eye } from 'lucide-react'
import type { Contact } from '../types'
import { GroupBadge } from './GroupBadge'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

interface Props {
  contact: Contact
  onEdit: (c: Contact) => void
  onDelete: (id: string) => void
  onShare: (c: Contact) => void
  onView: (c: Contact) => void
  selectionMode?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}

const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

function getAvatarColor(name: string): string {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
  return PALETTE[code % PALETTE.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export function ContactCard({
  contact,
  onEdit,
  onDelete,
  onShare,
  onView,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: Props) {
  const [copied, copy] = useCopyToClipboard()

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el contacto "${contact.name}"?`)) {
      onDelete(contact.id)
    }
  }

  const handleCopy = () => {
    copy(contact.email)
  }

  const avatarColor = getAvatarColor(contact.name)
  const initials = getInitials(contact.name)

  return (
    <div
      onClick={selectionMode ? () => onToggleSelect?.(contact.id) : undefined}
      className={`group bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow ${
        selectionMode ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-primary-400 dark:border-primary-600 ring-2 ring-primary-200 dark:ring-primary-900'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar / selection checkbox */}
        {selectionMode ? (
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect?.(contact.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Seleccionar ${contact.name}`}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
        ) : (
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {contact.name}
            </h3>
            {/* Action buttons — visible on hover, hidden in selection mode */}
            {!selectionMode && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => onView(contact)}
                  aria-label="Ver contacto"
                  className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopy}
                  aria-label="Copiar email"
                  className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onShare(contact)}
                  aria-label="Compartir contacto"
                  className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEdit(contact)}
                  aria-label="Editar contacto"
                  className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  aria-label="Eliminar contacto"
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {contact.email}
            </span>
          </div>

          {contact.phone && (
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{contact.phone}</span>
            </div>
          )}

          {contact.company && (
            <div className="flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {contact.company}
                {contact.job_title ? ` · ${contact.job_title}` : ''}
              </span>
            </div>
          )}

          {(contact.group || contact.is_shared) && (
            <div className="flex items-center gap-1.5 mt-2">
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
        </div>
      </div>
    </div>
  )
}
