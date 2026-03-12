import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import SettingsPage from '@/features/settings/SettingsPage'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useUpdateProfile } from '@/features/settings/hooks/useUpdateProfile'
import { useChangePassword } from '@/features/settings/hooks/useChangePassword'
import { useMFASetup } from '@/features/settings/hooks/useMFASetup'
import { useMFADisable } from '@/features/settings/hooks/useMFADisable'

vi.mock('@/store/authStore')
vi.mock('@/store/uiStore')
vi.mock('@/features/settings/hooks/useUpdateProfile')
vi.mock('@/features/settings/hooks/useChangePassword')
vi.mock('@/features/settings/hooks/useMFASetup')
vi.mock('@/features/settings/hooks/useMFADisable')

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

const mockAuthState = {
  user: {
    id: 'u1',
    email: 'user@acme.com',
    first_name: 'Test',
    last_name: 'User',
    is_active: true,
    email_verified: true,
    permissions: [],
    roles: ['Member'],
    mfa_enabled: false,
    last_login: null,
    created_at: '2026-01-01T00:00:00Z',
  },
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
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <SettingsPage /> }], { initialEntries: ['/'] })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SettingsPage a11y', () => {
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
    vi.mocked(useUpdateProfile).mockReturnValue(mockMutation as unknown as ReturnType<typeof useUpdateProfile>)
    vi.mocked(useChangePassword).mockReturnValue(mockMutation as unknown as ReturnType<typeof useChangePassword>)
    vi.mocked(useMFASetup).mockReturnValue(mockMutation as unknown as ReturnType<typeof useMFASetup>)
    vi.mocked(useMFADisable).mockReturnValue(mockMutation as unknown as ReturnType<typeof useMFADisable>)
  })

  it('renders without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
