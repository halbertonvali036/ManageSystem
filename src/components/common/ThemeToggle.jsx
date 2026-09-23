import { Moon, Sun } from 'lucide-react'
import useTheme from '@/hooks/useTheme'

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      className={`theme-toggle${className ? ` ${className}` : ''}`}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={17} />
        <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={17} />
      </span>
    </button>
  )
}

export default ThemeToggle