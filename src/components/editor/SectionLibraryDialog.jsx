import { Columns2, Handshake, LayoutPanelTop, Megaphone, MessageSquareQuote, PanelBottom, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { SITE_SECTIONS } from '@/models/siteSection'

const SECTION_ICONS = {
  hero: Sparkles,
  features: Columns2,
  cta: Megaphone,
  split: LayoutPanelTop,
  testimonials: MessageSquareQuote,
  contact: Handshake,
  footer: PanelBottom,
}

/**
 * The section picker.
 *
 * A modal dialog rather than a dropdown, because the library is a list of things
 * with a name and a short description, and a dropdown would hide exactly the
 * information someone needs to choose.
 *
 * The list shows only the seven library sections. A band with no library type can
 * be reached from the canvas as a side effect of deleting every section, so it
 * is never offered here as if it were a designed section.
 *
 * Adding a section edits local state only. The dialog does not save, publish or
 * claim the page now has that section anywhere but this draft.
 */
function SectionLibraryDialog({ isOpen, onClose, onAddSection }) {
  const { t } = useTranslation()
  const closeRef = useRef(null)
  const dialogRef = useRef(null)

  // Move focus into the dialog on open so a keyboard user is not left behind on
  // the button that opened it.
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      // Keep Tab inside the dialog while it is open.
      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) {
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="editor-dialog-layer">
      {/*
        A real dismiss layer. The button is only there to catch clicks on the
        backdrop, so it carries the close label and no content.
      */}
      <button
        type="button"
        className="editor-dialog__backdrop"
        onClick={onClose}
        aria-label={t('common.close')}
      />

      <div
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-section-dialog-title"
        ref={dialogRef}
      >
        <div className="editor-dialog__head">
          <div>
            <h2 className="editor-dialog__title" id="editor-section-dialog-title">
              {t('editor.section.libraryTitle')}
            </h2>
            <p className="editor-dialog__hint">{t('editor.section.libraryHint')}</p>
          </div>
          <button
            type="button"
            className="editor-icon-button"
            onClick={onClose}
            ref={closeRef}
            aria-label={t('editor.section.libraryClose')}
          >
            {t('common.close')}
          </button>
        </div>

        <ul className="editor-section-library">
          {SITE_SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.id] ?? LayoutPanelTop
            return (
              <li key={section.id}>
                <button
                  type="button"
                  className="editor-section-library__item"
                  onClick={() => onAddSection(section.id)}
                >
                  <span className="editor-section-library__icon" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <span className="editor-section-library__copy">
                    <span className="editor-section-library__name">{t(section.nameKey)}</span>
                    <span className="editor-section-library__text">
                      {t(section.descriptionKey)}
                    </span>
                    <span className="editor-section-library__meta">
                      {t('editor.section.blockCount', { count: section.blocks.length })}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="editor-dialog__note">{t('editor.section.localOnly')}</p>
      </div>
    </div>
  )
}

export default SectionLibraryDialog
