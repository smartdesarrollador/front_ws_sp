import { Pencil, Trash2, Mail, Phone, Building2, Share2 } from 'lucide-react'
import type { Contact } from '../types'
import { GroupBadge } from './GroupBadge'

interface Props {
  contact: Contact
  onEdit: (c: Contact) => void
  onDelete: (id: string) => void
  onShare: (c: Contact) => void
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

export function ContactCard({ contact, onEdit, onDelete, onShare }: Props) {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el contacto "${contact.name}"?`)) {
      onDelete(contact.id)
    }
  }

  const avatarColor = getAvatarColor(contact.name)
  const initials = getInitials(contact.name)

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {contact.name}
            </h3>
            {/* Action buttons — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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

          {contact.group && (
            <div className="mt-2">
              <GroupBadge group={contact.group} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
