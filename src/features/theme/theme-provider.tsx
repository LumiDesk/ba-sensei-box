import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ThemeContext,
  type ResolvedTheme,
  type ThemeContextValue,
  type ThemeMode,
} from './theme-context'

const THEME_KEY = 'ba-sensei-box:theme'

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

function getSystemDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const fromQuery = new URLSearchParams(window.location.search).get('theme')
  if (isThemeMode(fromQuery)) return fromQuery
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (isThemeMode(stored)) return stored
  } catch {
    // Ignore storage restrictions; follow the system preference instead.
  }
  return 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)
  const [systemDark, setSystemDark] = useState(getSystemDark)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme: ResolvedTheme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolvedTheme === 'dark' ? '#0b1220' : '#f4f7ff')
    try {
      window.localStorage.setItem(THEME_KEY, mode)
    } catch {
      // The in-memory preference still works for this session.
    }
  }, [mode, resolvedTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, setMode }),
    [mode, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
