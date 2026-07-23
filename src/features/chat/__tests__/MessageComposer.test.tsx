import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageComposer } from '../components/MessageComposer'

function setup(
  onSend = vi.fn(),
  onTyping = vi.fn(),
  maxFileMb?: number | null,
  canUpgrade?: boolean,
) {
  render(
    <MessageComposer
      replyTo={null}
      onClearReply={vi.fn()}
      onSend={onSend}
      onTyping={onTyping}
      isSending={false}
      maxFileMb={maxFileMb}
      canUpgrade={canUpgrade}
    />,
  )
  return { onSend, onTyping }
}

describe('MessageComposer', () => {
  it('sends text with a null file', () => {
    const { onSend } = setup()
    fireEvent.change(screen.getByLabelText('Escribe un mensaje'), { target: { value: 'hola' } })
    fireEvent.click(screen.getByLabelText('Enviar mensaje'))
    expect(onSend).toHaveBeenCalledWith('hola', null)
  })

  it('fires onTyping while typing', () => {
    const { onTyping } = setup()
    fireEvent.change(screen.getByLabelText('Escribe un mensaje'), { target: { value: 'h' } })
    expect(onTyping).toHaveBeenCalled()
  })

  it('attaches a file and sends it', () => {
    const { onSend } = setup()
    const file = new File(['data'], 'photo.png', { type: 'image/png' })
    fireEvent.change(screen.getByTestId('chat-file-input'), { target: { files: [file] } })
    expect(screen.getByText('photo.png')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Enviar mensaje'))
    expect(onSend).toHaveBeenCalledWith('', file)
  })

  it('rejects a file over the plan limit with an upgrade CTA when upgrade is possible', () => {
    setup(vi.fn(), vi.fn(), 5, true)
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.pdf')
    fireEvent.change(screen.getByTestId('chat-file-input'), { target: { files: [big] } })
    expect(
      screen.getByText(
        'El archivo supera el límite de 5 MB de tu plan. Cambia a un plan superior para aumentar la capacidad.',
      ),
    ).toBeInTheDocument()
  })

  it('omits the upgrade CTA on the top plan (canUpgrade=false)', () => {
    setup(vi.fn(), vi.fn(), 100, false)
    const big = new File([new Uint8Array(100 * 1024 * 1024 + 1)], 'big.pdf')
    fireEvent.change(screen.getByTestId('chat-file-input'), { target: { files: [big] } })
    expect(screen.getByText('El archivo supera el límite de 100 MB.')).toBeInTheDocument()
    expect(screen.queryByText(/Cambia a un plan superior/)).toBeNull()
  })

  it('accepts a file that fits a higher plan limit', () => {
    const { onSend } = setup(vi.fn(), vi.fn(), 25)
    const file = new File([new Uint8Array(10 * 1024 * 1024)], 'doc.pdf')
    fireEvent.change(screen.getByTestId('chat-file-input'), { target: { files: [file] } })
    expect(screen.getByText('doc.pdf')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Enviar mensaje'))
    expect(onSend).toHaveBeenCalledWith('', file)
  })

  it('falls back to a default limit (and generic message) when none is provided', () => {
    setup()
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.pdf')
    fireEvent.change(screen.getByTestId('chat-file-input'), { target: { files: [big] } })
    expect(screen.getByText('El archivo supera el límite de 10 MB.')).toBeInTheDocument()
  })

  it('restricts the file input with an accept attribute', () => {
    setup()
    expect(screen.getByTestId('chat-file-input')).toHaveAttribute('accept')
  })
})
