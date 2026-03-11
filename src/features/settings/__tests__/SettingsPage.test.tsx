import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SettingsPage from '../SettingsPage'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { useChangePassword } from '../hooks/useChangePassword'
import { useMFASetup } from '../hooks/useMFASetup'
import { useMFADisable } from '../hooks/useMFADisable'

vi.mock('@/store/authStore')
vi.mock('@/store/uiStore')
vi.mock('../hooks/useUpdateProfile')
vi.mock('../hooks/useChangePassword')
vi.mock('../hooks/useMFASetup')
vi.mock('../hooks/useMFADisable')

const mockMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
  reset: vi.fn(),
  status: 'idle' as const,
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isIdle: true,
  isPaused: false,
  submittedAt: 0,
}

const mockUser = {
  id: 'u1',
  email: 'user@acme.com',
  first_name: 'Juan',
  last_name: 'García',
  is_active: true,
  email_verified: true,
  permissions: [],
  roles: ['Member'],
  mfa_enabled: false,
  last_login: null,
  created_at: '2026-01-01T00:00:00Z',
}

const mockAuthState = {
  user: mockUser,
  tenant: null,
  accessToken: 'token',
  isAuthenticated: true,
  setUser: vi.fn(),
  setTenant: vi.fn(),
  setAccessToken: vi.fn(),
  clearAuth: vi.fn(),
}

const mockUiState = {
  darkMode: false,
  toggleDarkMode: vi.fn(),
  sidebarOpen: true,
  toggleSidebar: vi.fn(),
  language: 'es' as const,
  setLanguage: vi.fn(),
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <SettingsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useAuthStore).mockImplementation((selector: any) =>
      typeof selector === 'function' ? selector(mockAuthState) : mockAuthState,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useUiStore).mockImplementation((selector: any) =>
      typeof selector === 'function' ? selector(mockUiState) : mockUiState,
    )
    vi.mocked(useUpdateProfile).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useUpdateProfile>,
    )
    vi.mocked(useChangePassword).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useChangePassword>,
    )
    vi.mocked(useMFASetup).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useMFASetup>,
    )
    vi.mocked(useMFADisable).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useMFADisable>,
    )
  })

  it('renders all 4 tabs', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /seguridad/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /interfaz/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /notificaciones/i })).toBeInTheDocument()
  })

  it('shows password mismatch error', async () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /seguridad/i }))

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), {
      target: { value: 'old123' },
    })
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newPass1!' },
    })
    fireEvent.change(screen.getByLabelText(/confirmar/i), {
      target: { value: 'DIFERENTE' },
    })
    fireEvent.submit(screen.getByTestId('change-password-form'))

    expect(await screen.findByText(/contraseñas no coinciden/i)).toBeInTheDocument()
  })

  it('shows MFA QR when setup succeeds', () => {
    vi.mocked(useMFASetup).mockReturnValue({
      ...mockMutation,
      mutate: vi.fn().mockImplementation(
        (_data: undefined, opts?: { onSuccess?: (data: { qr_uri: string; secret: string }) => void }) => {
          opts?.onSuccess?.({ qr_uri: 'otpauth://totp/test', secret: 'ABCDEF' })
        },
      ),
    } as unknown as ReturnType<typeof useMFASetup>)

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /seguridad/i }))
    fireEvent.click(screen.getByRole('button', { name: /habilitar mfa/i }))

    expect(screen.getByAltText('MFA QR Code')).toBeInTheDocument()
  })

  it('switches tab on click', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /seguridad/i }))

    expect(screen.getByTestId('change-password-form')).toBeInTheDocument()
  })
})
