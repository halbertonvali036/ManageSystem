import useTranslation from '@/hooks/useTranslation'

/**
 * A real dismiss layer for the narrow-viewport drawers. The panels fall back
 * into the grid above 768px, where the stylesheet hides this.
 */
export default function EditorScrim({ onClose }) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      className="editor-scrim"
      aria-label={t('common.close')}
      onClick={onClose}
    />
  )
}
