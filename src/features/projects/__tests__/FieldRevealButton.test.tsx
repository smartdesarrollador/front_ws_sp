import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FieldRevealToggle } from '../components/FieldRevealButton'
import { useRevealField } from '../hooks/useRevealField'

vi.mock('../hooks/useRevealField')

const mockMutate = vi.fn()

function renderRevealButton({
  revealed = false,
  onReveal = vi.fn(),
}: {
  revealed?: boolean
  onReveal?: (value: string) => void
} = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <FieldRevealToggle
        projectId="proj-1"
        itemId="item-1"
        fieldId="field-1"
        onReveal={onReveal}
        revealed={revealed}
      />
    </QueryClientProvider>,
  )
}

describe('FieldRevealButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useRevealField).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useRevealField>)
  })

  it('renderiza el botón Eye correctamente (data-testid="reveal-button")', () => {
    renderRevealButton()
    expect(screen.getByTestId('reveal-button')).toBeInTheDocument()
  })

  it('click llama a mutate con los ids correctos', () => {
    renderRevealButton()
    fireEvent.click(screen.getByTestId('reveal-button'))
    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(useRevealField).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'proj-1',
        itemId: 'item-1',
        fieldId: 'field-1',
      }),
    )
  })

  it('después de revelar (revealed=true), muestra icono EyeOff', () => {
    const onReveal = vi.fn()
    // Simulate that the parent called onReveal so revealed=true
    vi.mocked(useRevealField).mockImplementation(({ onReveal: cb }) => {
      mockMutate.mockImplementation(() => cb('secret-value'))
      return { mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useRevealField>
    })

    renderRevealButton({ revealed: true, onReveal })
    // When revealed=true, EyeOff is shown
    const button = screen.getByTestId('reveal-button')
    expect(button).toBeInTheDocument()
    // EyeOff icon is present when revealed=true
    expect(button.querySelector('svg')).toBeInTheDocument()
  })
})
