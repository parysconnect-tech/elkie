import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'en' | 'es' | 'fr' | 'pt' | 'de'

export const LANGS: Lang[] = ['en', 'es', 'fr', 'pt', 'de']

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
}

export const LANG_FLAGS: Record<Lang, string> = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  pt: 'PT',
  de: 'DE',
}

type LanguageContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)
const STORAGE_KEY = 'elkie-lang'

function readInitial(): Lang {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null
  if (stored && LANGS.includes(stored)) return stored
  const browser = window.navigator.language.slice(0, 2) as Lang
  return LANGS.includes(browser) ? browser : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial)

  useEffect(() => {
    document.documentElement.lang = lang
    window.localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>')
  return ctx
}
