import { useState } from 'react'
import { useAddComment } from '../hooks/useAddComment'

interface Props {
  ticketId: string
}

export function CommentInput({ ticketId }: Props) {
  const [message, setMessage] = useState('')
  const addComment = useAddComment()

  const handleSend = () => {
    if (!message.trim() || addComment.isPending) return
    addComment.mutate(
      { ticket_id: ticketId, message },
      { onSuccess: () => setMessage('') },
    )
  }

  return (
    <div className="flex gap-3 pt-4 border-t border-gray-100">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe un comentario..."
        rows={2}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || addComment.isPending}
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 self-end flex items-center gap-2"
      >
        {addComment.isPending && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        Enviar
      </button>
    </div>
  )
}
