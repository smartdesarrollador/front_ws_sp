import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImportModal, { type ImportSummary } from '../ImportModal'
import ImportButton from '../ImportButton'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { usePermissions } from '@/hooks/usePermissions'

vi.mock('@/hooks/useFeatureGate')
vi.mock('@/hooks/usePermissions')

interface Row {
  name: string
}

const columns = [{ label: 'Nombre', value: (r: Row) => r.name }]
const parse = (text: string): Row[] => (text ? [{ name: 'Ada' }, { name: 'Alan' }] : [])

function mockFeature(enabled: boolean) {
  vi.mocked(useFeatureGate).mockReturnValue({
    hasFeature: () => enabled,
    getLimit: () => null,
    plan: enabled ? 'professional' : 'free',
    isLoading: false,
  })
}

function mockPermission(granted: boolean) {
  vi.mocked(usePermissions).mockReturnValue({
    hasPermission: () => granted,
    hasRole: () => granted,
    isOwner: granted,
    isAdmin: granted,
    getPrimaryRole: () => 'Owner',
    getRoleColor: () => '#000',
    tenant: null,
  } as unknown as ReturnType<typeof usePermissions>)
}

describe('ImportModal', () => {
  it('parses a picked file, previews rows and calls onImport, then shows the summary', async () => {
    const summary: ImportSummary = { created: 2, skipped: 0, errors: [] }
    const onImport = vi.fn().mockResolvedValue(summary)
    render(
      <ImportModal
        title="Importar contactos"
        accept=".vcf"
        parse={parse}
        columns={columns}
        onImport={onImport}
        onClose={vi.fn()}
      />,
    )

    const file = new File(['BEGIN:VCARD'], 'c.vcf', { type: 'text/vcard' })
    fireEvent.change(screen.getByTestId('import-file-input'), { target: { files: [file] } })

    await waitFor(() => expect(screen.getByText(/filas detectadas/i)).toBeInTheDocument())
    expect(screen.getByText('Ada')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Importar/i }))

    await waitFor(() => expect(onImport).toHaveBeenCalledWith([{ name: 'Ada' }, { name: 'Alan' }]))
    await waitFor(() => expect(screen.getByText('Importación completada')).toBeInTheDocument())
  })

  it('uses the async parseFile path (binary/ZIP) when provided', async () => {
    const summary: ImportSummary = { created: 1, skipped: 0, errors: [] }
    const onImport = vi.fn().mockResolvedValue(summary)
    const parseFile = vi.fn().mockResolvedValue([{ name: 'FromZip' }])
    render(
      <ImportModal
        title="Importar notas"
        accept=".zip"
        parseFile={parseFile}
        columns={columns}
        onImport={onImport}
        onClose={vi.fn()}
      />,
    )

    const file = new File(['PK...'], 'notas.zip', { type: 'application/zip' })
    fireEvent.change(screen.getByTestId('import-file-input'), { target: { files: [file] } })

    await waitFor(() => expect(parseFile).toHaveBeenCalledWith(file))
    await waitFor(() => expect(screen.getByText('FromZip')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Importar/i }))
    await waitFor(() => expect(onImport).toHaveBeenCalledWith([{ name: 'FromZip' }]))
  })
})

describe('ImportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPermission(true)
  })

  it('shows disabled fallback when feature is not available', () => {
    mockFeature(false)
    render(<ImportButton feature="contact_import" disabledHint="upgrade" renderModal={() => null} />)
    const btn = screen.getByRole('button', { name: /Importar/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('title', 'upgrade')
  })

  it('opens the modal when enabled', () => {
    mockFeature(true)
    render(
      <ImportButton
        feature="contact_import"
        renderModal={() => <div data-testid="the-modal">modal</div>}
      />,
    )
    expect(screen.queryByTestId('the-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Importar/i }))
    expect(screen.getByTestId('the-modal')).toBeInTheDocument()
  })

  it('returns null when the required permission is missing', () => {
    mockFeature(true)
    mockPermission(false)
    const { container } = render(
      <ImportButton feature="contact_import" permission="contacts.create" renderModal={() => null} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
