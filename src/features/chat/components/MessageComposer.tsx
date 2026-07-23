import { useRef, useState } from 'react'
import { Send, X, Paperclip, FileText } from 'lucide-react'
import type { Message } from '../types'

// Tipos aceptados por la categoría chat_attachment del backend (utils/uploads.py).
// Solo preselecciona el diálogo del SO; el backend es la autoridad.
const CHAT_ACCEPT =
  '.png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.csv,.zip,.docx,.xlsx'
// Fallback mientras el límite del plan carga o si el endpoint no responde.
const DEFAULT_MAX_MB = 10

interface MessageComposerProps {
  replyTo: Message | null
  onClearReply: () => void
  onSend: (content: string, file: File | null) => void
  onTyping?: () => void
  isSending: boolean
  /** Peso máximo por archivo del plan (MB), de useFeatureGate().getLimit('file_upload_mb'). */
  maxFileMb?: number | null
  /** true si el plan del tenant admite un upgrade (no Enterprise). Muestra el CTA de mejora. */
  canUpgrade?: boolean
}

export function MessageComposer({
  replyTo,
  onClearReply,
  onSend,
  onTyping,
  isSending,
  maxFileMb,
  canUpgrade,
}: MessageComposerProps) {
  const [value, setValue] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const limitMb = maxFileMb ?? DEFAULT_MAX_MB

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null
    setFileError('')
    if (picked && picked.size > limitMb * 1024 * 1024) {
      setFileError(
        canUpgrade
          ? `El archivo supera el límite de ${limitMb} MB de tu plan. Cambia a un plan superior para aumentar la capacidad.`
          : `El archivo supera el límite de ${limitMb} MB.`,
      )
      return
    }
    setFile(picked)
  }

  const submit = () => {
    const trimmed = value.trim()
    if ((!trimmed && !file) || isSending) return
    onSend(trimmed, file)
    setValue('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3">
      {replyTo && (
        <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
          <div className="min-w-0">
            <span className="font-medium text-primary-600">Respondiendo a {replyTo.sender.name}</span>
            <p className="truncate text-gray-500">{replyTo.content}</p>
          </div>
          <button
            type="button"
            aria-label="Cancelar respuesta"
            onClick={onClearReply}
            className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {file && (
        <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
          <span className="flex items-center gap-1 min-w-0 text-gray-600 dark:text-gray-300">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{file.name}</span>
          </span>
          <button
            type="button"
            aria-label="Quitar archivo"
            onClick={() => {
              setFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {fileError && <p className="mb-2 text-xs text-red-600">{fileError}</p>}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={CHAT_ACCEPT}
          onChange={handlePick}
          className="hidden"
          aria-label="Adjuntar archivo"
          data-testid="chat-file-input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Adjuntar archivo"
          className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onTyping?.()
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Escribe un mensaje…"
          aria-label="Escribe un mensaje"
          className="flex-1 resize-none px-3 py-2 max-h-32 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          onClick={submit}
          disabled={(!value.trim() && !file) || isSending}
          aria-label="Enviar mensaje"
          className="p-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
