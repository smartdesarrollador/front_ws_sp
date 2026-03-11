import type { TicketComment } from '../types'

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  comments: TicketComment[]
}

export function CommentThread({ comments }: Props) {
  if (comments.length === 0) {
    return <p className="text-sm text-gray-400">No hay comentarios aun</p>
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`flex gap-3 ${comment.role === 'client' ? 'flex-row-reverse' : ''}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              comment.role === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {comment.author_name.charAt(0).toUpperCase()}
          </div>
          <div
            className={`flex-1 flex flex-col ${
              comment.role === 'client' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-700">{comment.author_name}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  comment.role === 'agent'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                {comment.role === 'agent' ? 'Soporte' : 'Tu'}
              </span>
              <span className="text-xs text-gray-400">{relativeTime(comment.created_at)}</span>
            </div>
            <p
              className={`text-sm px-3 py-2 rounded-xl ${
                comment.role === 'agent'
                  ? 'bg-blue-50 text-blue-900'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {comment.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
