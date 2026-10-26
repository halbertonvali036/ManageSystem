import { PanelLeft, PanelRight, Save } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

/**
 * The narrow-viewport toolbar: open the left panel, save, open settings.
 *
 * It is only rendered outside preview mode. The save button is the same action
 * as the top bar's, so a phone user never has to open a drawer to retry a save.
 */
export default function EditorMobileTools({
  isLeftOpen,
  isRightOpen,
  onToggleLeft,
  onToggleRight,
  onSave,
}) {
  const { t } = useTranslation()

  return (
    <div className="editor__mobile-tools">
      <button
        type="button"
        className="editor-icon-button"
        aria-expanded={isLeftOpen}
        aria-controls="editor-left-panel"
        onClick={onToggleLeft}
      >
        <PanelLeft size={16} aria-hidden="true" />
        <span className="editor-visually-hidden">
          {t('editor.sidebar.toggleLabel')}
        </span>
      </button>

      <button
        type="button"
        className="btn btn--outline btn--sm"
        onClick={onSave}
      >
        <Save size={14} aria-hidden="true" />
        {t('editor.save.action')}
      </button>

      <button
        type="button"
        className="editor-icon-button"
        aria-expanded={isRightOpen}
        aria-controls="editor-right-panel"
        onClick={onToggleRight}
      >
        <PanelRight size={16} aria-hidden="true" />
        <span className="editor-visually-hidden">
          {t('editor.settings.toggleLabel')}
        </span>
      </button>
    </div>
  )
}
