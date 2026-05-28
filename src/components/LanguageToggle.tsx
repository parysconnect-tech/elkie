import { useState } from 'react'
import { Globe } from 'lucide-react'
import { LANG_LABELS, LANGS, useLanguage, type Lang } from '@/lib/language'
import { cn } from '@/lib/cn'

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="glass flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-text transition-transform hover:scale-105"
      >
        <Globe size={14} />
        <span className="font-medium uppercase">{lang}</span>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="glass absolute right-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl py-1 shadow-2xl"
          >
            {LANGS.map((l: Lang) => (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l === lang}
                  onClick={() => {
                    setLang(l)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-card-border',
                    l === lang && 'text-accent',
                  )}
                >
                  <span>{LANG_LABELS[l]}</span>
                  <span className="text-text-muted text-xs uppercase">{l}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
