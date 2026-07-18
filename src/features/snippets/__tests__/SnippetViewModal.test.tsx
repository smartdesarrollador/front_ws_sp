import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SnippetViewModal } from '../components/SnippetViewModal'
import type { CodeSnippet } from '../types'

const writeText = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  writeText.mockClear()
  Object.assign(navigator, { clipboard: { writeText } })
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
})

const snippet: CodeSnippet = {
  id: 's1',
  title: 'Fetch helper',
  description: 'Wrapper alrededor de fetch con manejo de errores',
  code: "function fetchJson(url) {\n  return fetch(url).then((r) => r.json())\n}",
  language: 'typescript',
  tags: ['api', 'auth'],
  is_favorite: false,
  is_shared: false,
  shared_by_name: null,
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-01T10:00:00Z',
}

function renderModal(props: { snippet?: CodeSnippet | null; open: boolean; onClose: () => void }) {
  return render(
    <SnippetViewModal snippet={props.snippet ?? null} open={props.open} onClose={props.onClose} />,
  )
}

describe('SnippetViewModal', () => {
  it('no renderiza nada si open es false', () => {
    renderModal({ snippet, open: false, onClose: vi.fn() })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no renderiza nada si no hay snippet', () => {
    renderModal({ snippet: null, open: true, onClose: vi.fn() })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza título, código, lenguaje, tags y descripción', () => {
    renderModal({ snippet, open: true, onClose: vi.fn() })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Fetch helper')).toBeInTheDocument()
    expect(screen.getByText(/function fetchJson/)).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('#api')).toBeInTheDocument()
    expect(screen.getByText('#auth')).toBeInTheDocument()
    expect(screen.getByText('Wrapper alrededor de fetch con manejo de errores')).toBeInTheDocument()
    expect(screen.getByText('Código')).toBeInTheDocument()
  })

  it('copia el título de forma independiente del código', async () => {
    renderModal({ snippet, open: true, onClose: vi.fn() })

    fireEvent.click(screen.getByLabelText('Copiar título'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Fetch helper')
    })
    await waitFor(() => {
      expect(screen.getByLabelText('Copiar título').querySelector('.text-green-500')).toBeTruthy()
    })
    expect(screen.getByLabelText('Copiar código').querySelector('.text-green-500')).toBeFalsy()
  })

  it('copia el código de forma independiente del título', async () => {
    renderModal({ snippet, open: true, onClose: vi.fn() })

    fireEvent.click(screen.getByLabelText('Copiar código'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(snippet.code)
    })
    await waitFor(() => {
      expect(screen.getByLabelText('Copiar código').querySelector('.text-green-500')).toBeTruthy()
    })
    expect(screen.getByLabelText('Copiar título').querySelector('.text-green-500')).toBeFalsy()
  })

  it('llama a onClose al hacer click en Cerrar', () => {
    const onClose = vi.fn()
    renderModal({ snippet, open: true, onClose })

    fireEvent.click(screen.getByText('Cerrar'))

    expect(onClose).toHaveBeenCalled()
  })
})
