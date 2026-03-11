import { Eye, EyeOff } from 'lucide-react'
import { useRevealField } from '../hooks/useRevealField'

interface Props {
  projectId: string
  itemId: string
  fieldId: string
  onReveal: (value: string) => void
}

export function FieldRevealButton({ projectId, itemId, fieldId, onReveal }: Props) {
  const reveal = useRevealField({ projectId, itemId, fieldId, onReveal })
  const isRevealed = false // managed by parent via onReveal callback

  return (
    <button
      data-testid="reveal-button"
      onClick={() => reveal.mutate()}
      disabled={reveal.isPending}
      aria-label={isRevealed ? 'Ocultar valor' : 'Revelar valor'}
      className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded disabled:opacity-50"
    >
      {reveal.isPending ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
      ) : (
        <Eye className="w-3.5 h-3.5" />
      )}
    </button>
  )
}

interface RevealedProps extends Props {
  revealed: boolean
}

export function FieldRevealToggle({ projectId, itemId, fieldId, onReveal, revealed }: RevealedProps) {
  const reveal = useRevealField({ projectId, itemId, fieldId, onReveal })

  return (
    <button
      data-testid="reveal-button"
      onClick={() => reveal.mutate()}
      disabled={reveal.isPending}
      aria-label={revealed ? 'Ocultar valor' : 'Revelar valor'}
      className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded disabled:opacity-50"
    >
      {reveal.isPending ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
      ) : revealed ? (
        <EyeOff className="w-3.5 h-3.5" />
      ) : (
        <Eye className="w-3.5 h-3.5" />
      )}
    </button>
  )
}
