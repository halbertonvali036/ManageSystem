import { Search } from 'lucide-react'
import { openCommandPalette } from '@/components/commandPalette/commandPaletteManager'

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

const SHORTCUT_LABEL = isMac ? '⌘ K' : 'Ctrl K'

function CommandPaletteTrigger() {
  return (
    <button
      type="button"
      className="command-trigger"
      onClick={openCommandPalette}
      aria-label={`Open search (${SHORTCUT_LABEL})`}
    >
      <Search size={18} aria-hidden="true" />
      <span className="command-trigger__label">Search</span>
      <kbd className="command-trigger__kbd">{SHORTCUT_LABEL}</kbd>
    </button>
  )
}

export default CommandPaletteTrigger