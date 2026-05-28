import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="glass flex h-9 w-9 items-center justify-center rounded-full text-text transition-transform hover:scale-110"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
