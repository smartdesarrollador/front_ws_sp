import { useNavigate } from 'react-router-dom'
import { Folder, FileText, File, Code2, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SharedItem } from '../types'
import { AccessLevelBadge } from './AccessLevelBadge'

// Mantener en sync con Share.RESOURCE_TYPES (apps/backend_django/apps/sharing/models.py):
// solo project, section, item, snippet, note y contact son compartibles.
const RESOURCE_ICONS: Record<string, LucideIcon> = {
  project: Folder,
  note: FileText,
  snippet: Code2,
  contact: Users,
}

const RESOURCE_ROUTES: Record<string, string> = {
  project: '/projects',
  note: '/notes',
  snippet: '/snippets',
  contact: '/contacts',
}

function getResourceIcon(resourceType: string): LucideIcon {
  return RESOURCE_ICONS[resourceType] ?? File
}

interface Props {
  item: SharedItem
}

export function SharedItemCard({ item }: Props) {
  const navigate = useNavigate()
  const ResourceIcon = getResourceIcon(item.resource_type)

  const expiresAt = item.expires_at
    ? new Date(item.expires_at).toLocaleDateString('es-ES')
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Resource header */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-50 rounded-lg shrink-0">
          <ResourceIcon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{item.resource_name}</p>
          <p className="text-xs text-gray-400 capitalize">{item.resource_type}</p>
        </div>
      </div>

      {/* Shared by */}
      <div>
        <p className="text-xs text-gray-400">Compartido por</p>
        <p className="text-sm font-medium text-gray-800">{item.shared_by_name}</p>
        <p className="text-xs text-gray-500">{item.shared_by_email}</p>
      </div>

      {/* Access badge */}
      <div>
        <AccessLevelBadge level={item.access_level} />
      </div>

      {/* Expires at */}
      {expiresAt && (
        <p className="text-xs text-orange-600 font-medium">Expira: {expiresAt}</p>
      )}

      {/* Message */}
      {item.message && (
        <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 border-l-2 border-indigo-400">
          {item.message}
        </p>
      )}

      {/* Action */}
      <div className="pt-1 border-t border-gray-100">
        <button
          onClick={() => navigate(RESOURCE_ROUTES[item.resource_type] ?? '/')}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          Abrir →
        </button>
      </div>
    </div>
  )
}
