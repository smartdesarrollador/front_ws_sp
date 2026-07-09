import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions: string[]
  placeholder?: string
}

export function TagInput({ value, onChange, suggestions, placeholder }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const filteredSuggestions = suggestions.filter(
    (s) => s.includes(inputValue.trim().toLowerCase()) && !value.includes(s),
  )

  const commitTag = (raw: string) => {
    const tag = raw.trim().toLowerCase()
    if (!tag || value.includes(tag)) return
    onChange([...value, tag])
    setInputValue('')
    setDropdownOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    } else if (e.key === 'Escape') {
      setDropdownOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-1.5 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-primary-500">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded-full"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Quitar etiqueta ${tag}`}
              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setDropdownOpen(true)
          }}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] text-sm bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none"
        />
      </div>
      {dropdownOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-40 overflow-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          {filteredSuggestions.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => commitTag(tag)}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                #{tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
