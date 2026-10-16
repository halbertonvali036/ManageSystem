import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { ArrowRight, Check, LayoutTemplate, Monitor, Smartphone, Tablet } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import EditorCanvas from '@/components/editor/EditorCanvas'
import { createLocalDraftDocument, EDITOR_DEVICE, EDITOR_DEVICES } from '@/models/siteEditor'
import { normalizeSiteTheme } from '@/models/siteTheme'
import {
  countTemplateSections,
  getTemplatePageSkeletons,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_TIER_LABELS,
} from '@/models/siteTemplate'
import { NEW_SITE_PATH } from '@/utils/constants'

const DEVICE_ICONS = {
  [EDITOR_DEVICE.DESKTOP]: Monitor,
  [EDITOR_DEVICE.TABLET]: Tablet,
  [EDITOR_DEVICE.MOBILE]: Smartphone,
}

/**
 * The template preview dialog.
 *
 * Builds an ordinary local draft and renders its active page with EditorCanvas.
 * The gallery cards remain lightweight schematics; only this open dialog renders
 * blocks and preview motion. Page/device switching keeps the draft stable.
 *
 * Nothing here creates a project. The primary action is a link to the create
 * wizard with the template id in the query string, exactly like the card's.
 */
function TemplatePreviewDialog({ template, onClose }) {
  const { t } = useTranslation()
  const [pageIndex, setPageIndex] = useState(0)
  const [device, setDevice] = useState(EDITOR_DEVICE.DESKTOP)
  const closeRef = useRef(null)
  const dialogRef = useRef(null)

  const pages = template.pages
  const sectionCount = countTemplateSections(template)
  const draft = useMemo(() => ({
    ...createLocalDraftDocument({ t, pageSkeletons: getTemplatePageSkeletons(template.id).map(page => ({ ...page, name: t(page.nameKey) })) }),
    theme: normalizeSiteTheme(template.themePreset),
  }), [template, t])
  const activePage = draft.pages[pageIndex] ?? draft.pages[0]

  // Move focus into the dialog on open and hand it back to whatever opened it.
  useEffect(() => {
    const trigger = document.activeElement
    closeRef.current?.focus()
    return () => {
      if (trigger instanceof HTMLElement) {
        trigger.focus()
      }
    }
  }, [])

  // Keep the page behind the dialog still while it is open.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
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
  }, [onClose])

  return createPortal(
    <div className="editor-dialog-layer template-preview-layer">
      {/* A real dismiss layer: the button only catches backdrop clicks. */}
      <button
        type="button"
        className="editor-dialog__backdrop"
        onClick={onClose}
        aria-label={t('common.close')}
      />

      <div
        className="editor-dialog template-preview"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-preview-title"
        ref={dialogRef}
      >
        <div className="template-preview__head">
          <div className="template-preview__identity">
            <p className="template-preview__eyebrow">
              <span>{t(TEMPLATE_CATEGORY_LABELS[template.category] ?? 'templates.categoryBasic')}</span>
              <span className="template-preview__tier" data-tier={template.tier}>
                {t(TEMPLATE_TIER_LABELS[template.tier])}
              </span>
            </p>
            <h2 className="template-preview__title" id="template-preview-title">
              {t(template.nameKey)}
            </h2>
            <p className="template-preview__text">{t(template.descriptionKey)}</p>
          </div>
          <button
            type="button"
            className="editor-icon-button template-preview__close"
            onClick={onClose}
            ref={closeRef}
            aria-label={t('common.close')}
          >
            {t('common.close')}
          </button>
        </div>

        {template.features.length ? (
          <ul className="template-preview__features">
            {template.features.map((feature) => (
              <li key={feature}>
                <Check size={14} aria-hidden="true" />
                {t(feature)}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="template-preview__controls">
          <div
            className="template-preview__pages"
            role="group"
            aria-label={t('templates.previewPageLabel')}
          >
            {pages.map((page, index) => (
              <button
                key={page.id}
                type="button"
                className="template-preview__page"
                aria-pressed={index === pageIndex}
                onClick={() => setPageIndex(index)}
              >
                {t(page.nameKey)}
              </button>
            ))}
          </div>

          {/* The same device widths and responsive overrides as the editor. */}
          <div
            className="template-preview__devices"
            role="group"
            aria-label={t('templates.previewDeviceLabel')}
          >
            {EDITOR_DEVICES.map(({ id, labelKey }) => {
              const Icon = DEVICE_ICONS[id]
              const isActive = id === device
              return (
                <button
                  key={id}
                  type="button"
                  className={`template-preview__device${isActive ? ' is-active' : ''}`}
                  aria-pressed={isActive}
                  aria-label={t(labelKey)}
                  title={t(labelKey)}
                  onClick={() => setDevice(id)}
                >
                  <Icon size={15} aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="template-preview__viewport" data-device={device}>
          <EditorCanvas
            document={{ ...draft, activePageId: activePage.id }}
            activePage={activePage}
            device={device}
            isPreview
            onNavigatePage={(id) => setPageIndex(draft.pages.findIndex(page => page.id === id))}
          />
        </div>

        <p className="template-preview__note">{t('templates.previewStructureNote')}</p>

        <div className="template-preview__foot">
          <div className="template-preview__facts">
            <p className="template-preview__counts">
              <span>{t('templates.pageCount', { count: pages.length })}</span>
              <span>{t('templates.sectionCount', { count: sectionCount })}</span>
              <span>{t(TEMPLATE_TIER_LABELS[template.tier])}</span>
            </p>
            <p className="template-preview__hint">{t('templates.previewHint')}</p>
          </div>
          <div className="template-preview__actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              {t('common.close')}
            </button>
            <Link
              to={`${NEW_SITE_PATH}?template=${template.id}`}
              className="btn btn--primary"
              onClick={onClose}
            >
              <LayoutTemplate size={15} aria-hidden="true" />
              {t('templates.useTemplate')}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default TemplatePreviewDialog
