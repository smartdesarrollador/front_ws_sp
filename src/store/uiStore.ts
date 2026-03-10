import { create } from 'zustand'
import i18n from '@/i18n/config'

type Language = 'es' | 'en'

interface UiState {
  darkMode: boolean
  toggleDarkMode: () => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  language: Language
  setLanguage: (lang: Language) => void
}

const getInitialDarkMode = (): boolean => {
  try { return localStorage.getItem('ws-theme') === 'dark' } catch { return false }
}

const getInitialSidebarOpen = (): boolean => {
  try { return localStorage.getItem('ws-sidebar') !== 'false' } catch { return true }
}

const getInitialLanguage = (): Language => {
  try {
    const lang = localStorage.getItem('ws-lang')
    return lang === 'en' ? 'en' : 'es'
  } catch { return 'es' }
}

const syncDarkMode = (enabled: boolean) => {
  document.documentElement.classList.toggle('dark', enabled)
  try { localStorage.setItem('ws-theme', enabled ? 'dark' : 'light') } catch { /* ignore */ }
}

// Apply initial dark mode class before first render to avoid flash
;(syncDarkMode)(getInitialDarkMode())

export const useUiStore = create<UiState>((set) => ({
  darkMode: getInitialDarkMode(),
  sidebarOpen: getInitialSidebarOpen(),
  language: getInitialLanguage(),
  toggleDarkMode: () =>
    set((s) => { const next = !s.darkMode; syncDarkMode(next); return { darkMode: next } }),
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarOpen
      try { localStorage.setItem('ws-sidebar', String(next)) } catch { /* ignore */ }
      return { sidebarOpen: next }
    }),
  setLanguage: (lang) => {
    i18n.changeLanguage(lang)
    try { localStorage.setItem('ws-lang', lang) } catch { /* ignore */ }
    set({ language: lang })
  },
}))
