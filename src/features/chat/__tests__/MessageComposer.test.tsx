import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageComposer } from '../components/MessageComposer'

function setup(onSend = vi.fn(), onTyping = vi.fn()) {
  render(
    <MessageComposer
      replyTo={null}
      onClearReply={vi.fn()}
      onSend={onSend}
      onTyping={onTyping}
      isSending={false}
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

  it('rejects a file larger than 10 MB', () => {
    setup()
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.bin')
    fireEvent.change(screen.getByTestId('chat-file-input'), { target: { files: [big] } })
    expect(screen.getByText('El archivo supera los 10 MB')).toBeInTheDocument()
  })
})
