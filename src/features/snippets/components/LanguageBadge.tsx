import type { SnippetLanguage } from '../types'

export const LANG_CONFIG: Record<SnippetLanguage, { label: string; color: string; bg: string }> = {
  javascript: { label: 'JavaScript', color: 'text-yellow-800', bg: 'bg-yellow-100' },
  typescript: { label: 'TypeScript', color: 'text-blue-800',   bg: 'bg-blue-100'   },
  python:     { label: 'Python',     color: 'text-green-800',  bg: 'bg-green-100'  },
  bash:       { label: 'Bash',       color: 'text-gray-800',   bg: 'bg-gray-100'   },
  sql:        { label: 'SQL',        color: 'text-orange-800', bg: 'bg-orange-100' },
  html:       { label: 'HTML',       color: 'text-red-800',    bg: 'bg-red-100'    },
  css:        { label: 'CSS',        color: 'text-purple-800', bg: 'bg-purple-100' },
  json:       { label: 'JSON',       color: 'text-gray-800',   bg: 'bg-gray-100'   },
  yaml:       { label: 'YAML',       color: 'text-pink-800',   bg: 'bg-pink-100'   },
  dockerfile: { label: 'Dockerfile', color: 'text-blue-800',   bg: 'bg-blue-100'   },
  go:         { label: 'Go',         color: 'text-cyan-800',   bg: 'bg-cyan-100'   },
  rust:       { label: 'Rust',       color: 'text-orange-800', bg: 'bg-orange-100' },
  java:       { label: 'Java',       color: 'text-red-800',    bg: 'bg-red-100'    },
  other:      { label: 'Otro',       color: 'text-gray-800',   bg: 'bg-gray-100'   },
}

interface Props {
  language: SnippetLanguage
}

export default function LanguageBadge({ language }: Props) {
  const { label, color, bg } = LANG_CONFIG[language] ?? LANG_CONFIG.other
  return (
    <span className={`${bg} ${color} px-2 py-0.5 rounded text-xs font-medium`}>
      {label}
    </span>
  )
}
