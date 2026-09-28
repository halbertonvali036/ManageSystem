import { Search } from 'lucide-react'
import { openCommandPalette } from '@/components/commandPalette/commandPaletteManager'
import useTranslation from '@/hooks/useTranslation'

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

const SHORTCUT_LABEL = isMac ? '⌘ K' : 'Ctrl K'

function CommandPaletteTrigger() {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      className="command-trigger"
      onClick={openCommandPalette}
      aria-label={t('commandPalette.openSearch', { shortcut: SHORTCUT_LABEL })}
    >
      <Search size={18} aria-hidden="true" />
      <span className="command-trigger__label">{t('commandPalette.search')}</span>
      <kbd className="command-trigger__kbd">{SHORTCUT_LABEL}</kbd>
    </button>
  )
}

export default CommandPaletteTrigger
