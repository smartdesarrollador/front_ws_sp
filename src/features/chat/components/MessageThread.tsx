import { useEffect, useMemo, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { dayLabel } from '../utils'
import type { ConvertTarget, Message } from '../types'

interface MessageThreadProps {
  messages: Message[]
  isLoading: boolean
  onReply: (message: Message) => void
  onConvert: (message: Message, target: ConvertTarget) => void
}

interface DayGroup {
  key: string
  label: string
  items: Message[]
}

export function MessageThread({ messages, isLoading, onReply, onConvert }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const groups = useMemo<DayGroup[]>(() => {
    const result: DayGroup[] = []
    for (const message of messages) {
      const key = new Date(message.created_at).toDateString()
      const last = result[result.length - 1]
      if (last && last.key === key) {
        last.items.push(message)
      } else {
        result.push({ key, label: dayLabel(message.created_at), items: [message] })
      }
    }
    return result
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'auto' })
  }, [messages.length])

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}
          >
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No hay mensajes aún. ¡Envía el primero!
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {groups.map((group) => (
        <div key={group.key} className="space-y-2">
          <div className="flex justify-center">
            <span className="px-3 py-0.5 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-full">
              {group.label}
            </span>
          </div>
          {group.items.map((message, idx) => (
            <MessageBubble
              key={message.id}
              message={message}
              showSender={idx === 0 || group.items[idx - 1].sender.id !== message.sender.id}
              onReply={onReply}
              onConvert={onConvert}
            />
          ))}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
