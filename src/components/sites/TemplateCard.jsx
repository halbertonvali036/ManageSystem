import { ArrowRight, Eye, LayoutTemplate } from 'lucide-react'
import { Link } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import { countTemplateSections, TEMPLATE_CATEGORY_LABELS } from '@/models/siteTemplate'
import { getSiteTheme } from '@/models/siteTheme'
import { getSiteSection, SECTION_TYPE_LABELS } from '@/models/siteSection'
import { NEW_SITE_PATH } from '@/utils/constants'

/**
 * A tiny structural preview of the template.
 *
 * It draws the template's actual page and section skeleton rather than a stored
 * screenshot. That is a deliberate trade: with no image hosting there is no
 * honest way to have a real screenshot, and a hand-drawn illustration would be a
 * picture of a design that does not exist. This preview cannot disagree with what
 * the template creates, because it is built from the same data.
 */
function TemplatePreview({ template }) {
  const theme = getSiteTheme(template.themePreset)
  const pages = template.pages

  return (
    <span
      className="template-card__preview"
      aria-hidden="true"
      style={{
        background: theme.tokens.background,
        color: theme.tokens.text,
        '--template-accent': theme.tokens.primary,
      }}
      data-theme={theme.id}
    >
      {pages.map((page) => (
        <span className="template-card__page" key={page.id}>
          <span className="template-card__browser"><i /><i /><i /></span>
          {page.sections.length ? (
            page.sections.map((sectionId) => {
              const section = getSiteSection(sectionId)
              return (
                <span
                  className="template-card__band"
                  data-section={sectionId}
                  key={`${page.id}-${sectionId}`}
                  style={{
                    background:
                      section?.style.background === 'surface'
                        ? theme.tokens.surface
                        : section?.style.background === 'accent-soft'
                          ? theme.tokens.accentSoft
                          : 'transparent',
                    borderRadius: section?.style.radius ? theme.tokens.radiusScale : 0,
                    minHeight: sectionId === 'hero' ? 62 : 28,
                  }}
                >
                  <span className="template-card__skeleton-heading" />
                  <span className="template-card__skeleton-line" />
                  {sectionId === 'hero' || sectionId === 'cta' ? <span className="template-card__skeleton-button" /> : null}
                </span>
              )
            })
          ) : (
            <span className="template-card__band template-card__band--empty" />
          )}
        </span>
      ))}
    </span>
  )
}

/**
 * One starter template.
 *
 * "Bu şablonla başla" goes to the create wizard with this template preselected.
 * It does not create anything by itself: the wizard still collects the project's
 * name and slug, and the write stays unavailable until the backend exists.
 */
function TemplateCard({ template }) {
  const { t } = useTranslation()
  const sectionCount = countTemplateSections(template)

  return (
    <li className="template-card">
      <div className="template-card__frame">
        <TemplatePreview template={template} />
      </div>

      <div className="template-card__body">
        <p className="template-card__category">
          {t(TEMPLATE_CATEGORY_LABELS[template.category] ?? 'templates.categoryBasic')}
        </p>
        <h3 className="template-card__title">{t(template.nameKey)}</h3>
        <p className="template-card__text">{t(template.descriptionKey)}</p>

        <ul className="template-card__meta">
          <li>
            {t('templates.pageCount', { count: template.pages.length })}
          </li>
          <li>
            {t('templates.sectionCount', { count: sectionCount })}
          </li>
        </ul>
      </div>

      <details className="template-card__inspect">
        <summary><Eye size={15} aria-hidden="true" />{t('builderPolish.previewStructure')}</summary>
        <ul>
          {template.pages.map((page) => <li key={page.id}>
            <strong>{t(page.nameKey)}</strong>
            <span>{page.sections.length
              ? page.sections.map((id) => t(SECTION_TYPE_LABELS[id] ?? 'editor.section.custom')).join(' · ')
              : t('builderPolish.blankPage')}</span>
          </li>)}
        </ul>
      </details>
      <div className="template-card__actions">
        {/*
          The template id travels in the query string rather than as router
          state, so the link is a real, shareable URL and the wizard can be
          opened directly with a template already chosen.
        */}
        <Link
          to={`${NEW_SITE_PATH}?template=${template.id}`}
          className="btn btn--primary btn--sm"
        >
          <LayoutTemplate size={14} aria-hidden="true" />
          {t('templates.startAction')}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </li>
  )
}

export default TemplateCard
