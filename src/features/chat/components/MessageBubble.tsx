import { useState } from 'react'
import { MoreVertical, Reply, Paperclip } from 'lucide-react'
import { ConvertMenu } from './ConvertMenu'
import { clockTime } from '../utils'
import type { ConvertTarget, Message } from '../types'

interface MessageBubbleProps {
  message: Message
  showSender: boolean
  onReply: (message: Message) => void
  onConvert: (message: Message, target: ConvertTarget) => void
}

export function MessageBubble({ message, showSender, onReply, onConvert }: MessageBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const mine = message.is_mine

  const handleConvert = (target: ConvertTarget) => {
    setMenuOpen(false)
    onConvert(message, target)
  }

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
        {showSender && !mine && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 px-1">
            {message.sender.name}
          </span>
        )}
        <div className="flex items-center gap-1">
          {mine && (
            <div className="relative">
              <button
                type="button"
                aria-label="Opciones del mensaje"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-6">
                  <ConvertMenu onConvert={handleConvert} />
                </div>
              )}
            </div>
          )}
          <div
            className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
              mine
                ? 'bg-primary-600 text-white rounded-br-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
            }`}
          >
            {message.reply_to && (
              <div
                className={`mb-1 pl-2 border-l-2 text-xs opacity-80 ${
                  mine ? 'border-white/50' : 'border-gray-400'
                }`}
              >
                <span className="font-medium">{message.reply_to.sender_name}</span>
                <p className="truncate">{message.reply_to.content}</p>
              </div>
            )}
            {message.is_deleted ? (
              <span className="italic opacity-70">Mensaje eliminado</span>
            ) : (
              <>
                {message.attachments?.map((att) =>
                  att.kind === 'image' ? (
                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="block mb-1">
                      <img
                        src={att.url}
                        alt={att.original_name}
                        className="max-w-full max-h-60 rounded-lg"
                      />
                    </a>
                  ) : (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={att.original_name}
                      className={`flex items-center gap-2 mb-1 px-2 py-1.5 rounded-lg text-xs underline ${
                        mine ? 'bg-white/15' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <Paperclip className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{att.original_name}</span>
                    </a>
                  ),
                )}
                {message.content}
              </>
            )}
            <span
              className={`block text-[10px] mt-0.5 text-right ${
                mine ? 'text-white/70' : 'text-gray-400'
              }`}
            >
              {clockTime(message.created_at)}
            </span>
          </div>
          {!mine && (
            <div className="relative flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Responder mensaje"
                onClick={() => onReply(message)}
                className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-opacity"
              >
                <Reply className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Opciones del mensaje"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute left-0 top-6">
                  <ConvertMenu onConvert={handleConvert} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
